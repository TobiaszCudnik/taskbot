import AsyncMachine, { IState } from 'asyncmachine';
import { GmailQuery } from './gmail-query';
import { Sync } from './sync'
import { Semaphore } from 'await-semaphore';
import * as _ from 'underscore'
import {
	IConfig,
	TRawEmail
} from '../types'


class States extends AsyncMachine {

	Enabled: IState = {};
	SyncingEnabled: IState = {};

	Dirty: IState = {
		drop: ['QueryLabelsSynced', 'SyncingQueryLabels']
	};

	SyncingQueryLabels: IState = {
		auto: true,
		require: ['SyncingEnabled', 'LabelsFetched'],
		drop: ['QueryLabelsSynced']
	};
	QueryLabelsSynced: IState = {
		drop: ['SyncingQueryLabels']
	};

	FetchingLabels: IState = {
		auto: true,
		require: ['Enabled'],
		drop: ['LabelsFetched']
	};
	LabelsFetched: IState = {
		drop: ['FetchingLabels']
	};

	FetchingHistoryId: IState = {
		auto: true,
		require: ['Enabled'],
		drop: ['HistoryIdFetched']
	};
	HistoryIdFetched: IState = {
		drop: ['FetchingHistoryId']
	};
}


class Gmail {

	states: States;
	api: google.gmail.v1.Gmail;
	config: IConfig;
	sync: Sync;
	// completions = new Map<string, {
	// 	completed: boolean,
	// 	time: number
	// }>();
	history_id_timeout = 3000;
	history_id: number | null;
	last_sync_time: number;
	queries: GmailQuery[] = [];
	query_labels: {
		[query: string]: GmailQuery };
	query_labels_timer: number | null;
	labels: google.gmail.v1.Label[];
	semaphore: Semaphore;

	constructor(sync: Sync) {
		this.sync = sync;
		this.semaphore = sync.semaphore
		this.states = new States;
		this.states.setTarget(this);
		if (process.env['DEBUG']) {
			this.states
				.id('Gmail')
				.logLevel(process.env['DEBUG'])
		}
		this.api = this.sync.gmail_api;
		this.config = this.sync.config;
		this.initQueryLabels();
		this.states.pipe('QueryLabelsSynced', this.sync.states);
	}

	// ----- -----
	// Transitions
	// ----- -----

	// TODO extract to a separate class
	async SyncingQueryLabels_state() {
		this.query_labels_timer = Date.now();
		let abort = this.states.getAbort('SyncingQueryLabels');

		let dirty = false;
		await Promise.all(_.map(this.query_labels, 
				async (query: GmailQuery, name: string) => {

			query.states.add('Enabled')
			await query.states.when('ThreadsFetched');
			if (abort())
				return
			query.states.drop('Enabled');

			let labels = this.config.query_labels[name];
			await Promise.all(query.threads.map(async (thread) => {
				await this.modifyLabels(thread.id, labels[0], labels[1], abort);
				dirty = true;
			}))
		}))
		if (dirty)
			this.states.add('Dirty')

		if (abort())
			return

		if (!dirty)
			this.states.add('QueryLabelsSynced');
	};

	// TODO extract to a separate class
	QueryLabelsSynced_state() {
		this.last_sync_time = Date.now() - this.query_labels_timer;
		this.query_labels_timer = null;
		return console.log(`QueryLabels synced in: ${this.last_sync_time}ms`);
	}

	async FetchingLabels_state() {
		let abort = this.states.getAbort('FetchingLabels')
		let res = await this.req(this.api.users.labels.list, {userId: 'me'}, null, false);
		if (abort() || !res)
			return
		this.labels = res.labels;
		this.states.add('LabelsFetched')
	};

	Dirty_state() {
		this.history_id = null;
		for (let i = 0; i < this.queries.length; i++) {
			let query = this.queries[i];
			this.states.add(query.states, 'Dirty')
		}

		return this.states.drop('Dirty')
	}

	async FetchingHistoryId_state(abort?: () => boolean) {
		console.log('[FETCH] history ID')
		let response = await this.req(this.api.users.getProfile, {
			userId: 'me',
			fields: 'historyId'
		}, abort, false)
		// TODO redo when no response?
		if (!response || abort && abort())
			return
		this.history_id = parseInt(response.historyId, 10)
		this.last_sync_time = Date.now()
		this.states.add('HistoryIdFetched')
	};

	// ----- -----
	// Methods
	// ----- -----

	async fetchThread(id: string, historyId: number | null, abort?: () => boolean):
			Promise<google.gmail.v1.Thread | null> {
		// TODO type is missing
		let response = await this.req(this.api.users.threads.get, {
			id,
			userId: 'me',
			metadataHeaders: 'SUBJECT',
			format: 'metadata',
			fields: 'id,historyId,messages(id,labelIds,payload(headers))'
		}, null, false)
		// TODO delete the thread?
		if (abort && abort())
			return null

		return response
	}

	createQuery(query: string, name: string = '', fetch_msgs = false): GmailQuery {
		let gmail_query = new GmailQuery(this, query, name, fetch_msgs);
		this.queries.push(gmail_query)

		return gmail_query
	}

	// Searches all present gmail queries for the thread with the given ID.
	getThread(id: string, with_content = false): google.gmail.v1.Thread | null {
		for (let query of this.queries) {
			for (let thread of query.threads) {
				if (thread.id !== id)
					continue
				// TODO should break here?
				if (with_content && thread.messages && !thread.messages.length)
					continue
				return thread;
			}
		}
		return null
	}

	initQueryLabels() {
		this.query_labels = {};
		let count = 0;
		for (let query in this.config.query_labels) {
			// narrow the query to results requiring the labels modification
			let labels = this.config.query_labels[query];
			let exclusive_query = query;
			// labels to add
			if (labels[0].length) {
				exclusive_query += ' (-label:' +
					labels[0].map(this.normalizeLabelName).join(' OR -label:') + ')';
			}
			// labels to remove
			// TODO loose casting once compiler will figure
			if (labels[1] && (<string[]>labels[1]).length) {
				exclusive_query += ' (label:' +
					(<string[]>labels[1]).map(this.normalizeLabelName).join(' OR label:') + ')';
			}
			this.query_labels[query] = this.createQuery(exclusive_query, `QueryLabels ${++count}`);
		}

		return this.sync.log(`Initialized ${Object.keys(this.query_labels).length} queries`, 2);
	}

	normalizeLabelName(label: string) {
		return label
			.replace('/', '-')
			.replace(' ', '-')
			.toLowerCase();
	}

	isHistoryIdValid() {
		return this.history_id && Date.now() < this.last_sync_time + this.history_id_timeout;
	}

	async isCached(history_id: number, abort: () => boolean): Promise<boolean | null> {
		if (!this.isHistoryIdValid()) {
			if (!this.states.is('FetchingHistoryId')) {
				this.states.add('FetchingHistoryId', abort);
				// We need to wait for FetchingHistoryId being really added, not only queued
				await this.states.when('FetchingHistoryId', abort);
				if (abort && abort())
					return null
			}
			await this.states.when('HistoryIdFetched', abort);
			if (abort && abort())
				return null
		}

		return this.history_id <= history_id;
	};

	initAutoLabels() {}
//		for query, labels of @config.query_labels
//			query = new GmailQuery this, query, no

	getLabelsIds(labels: string[] | string): string[] {
		if (!Array.isArray(labels)) {
			labels = [labels];
		}

		let ret: string[] = []
		for (let name of labels) {
			let label = this.labels.find(
				label => label.name.toLowerCase() === name.toLowerCase())
			if (label)
				ret.push(label.id)
		}
		return ret
	}

	async modifyLabels(thread_id: string, add_labels: string[] = [], remove_labels: string[] = [],
			abort?: () => boolean): Promise<boolean> {
		let add_label_ids = this.getLabelsIds(add_labels)
		let remove_label_ids = this.getLabelsIds(remove_labels)
		let thread = this.getThread(thread_id, true)

		let label = thread ? `"${this.getTitleFromThread(thread)}"` : `ID: ${thread_id}`

		let log_msg = `Modifing labels for thread ${label} `
		if (add_labels.length) 
			log_msg += `+(${add_labels.join(' ')}) `

		if (remove_labels.length)
			log_msg += `-(${remove_labels.join(' ')})`

		console.log(log_msg)

		let ret = await this.req(this.api.users.threads.modify, {
			id: thread_id,
			userId: 'me',
			fields: 'id',
			resource: {
				addLabelIds: add_label_ids,
				removeLabelIds: remove_label_ids
			}
		}, abort, false)
		return Boolean(ret)
	}

		// TODO
//    # sync the DB
//    thread = @threads?.threads?.find (thread) ->
//      thread.id is thread_id
//    return if not thread
//
//    for msg in thread.messages
//      msg.labelIds = msg.labelIds.without.apply msg.labelIds, remove_label_ids
//      msg.labelIds.push add_label_ids

	async getHistoryId(abort?: () => boolean): Promise<number | null> {
		if (!this.history_id) {
			this.states.add('FetchingHistoryId', abort)
			await this.states.when('HistoryIdFetched')
		}

		return this.history_id;
	};

	// TODO check raw_email
	/**
	 * @returns Thread ID or null
	 */
	async createThread(raw_email: string, labels: string[], abort?: () => boolean):
			Promise<string | null> {
		console.log(`Creating thread (${labels.join(' ')})`);
		let message = await this.req(this.api.users.messages.insert, {
			userId: 'me',
			resource: {
				raw: raw_email,
				labelIds: this.getLabelsIds(labels)
			}}, abort, false)
		// TODO labels?
		this.states.add('Dirty', labels);
		if (!message || abort && abort())
			return null
		return message.threadId
	}

	createEmail(subject: string): TRawEmail {
		let email = [`From: ${this.sync.config.gmail_username} <${this.sync.config.gmail_username}>s`,
			`To: ${this.sync.config.gmail_username}`,
			"Content-type: text/html;charset=utf-8",
			"MIME-Version: 1.0",
			`Subject: ${subject}`].join("\r\n");

		return new Buffer(email)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_') as TRawEmail;
	}

	// TODO static or move to the thread class
	getTitleFromThread(thread: google.gmail.v1.Thread) {
		try { return thread.messages[0].payload.headers[0].value; }
		catch (e) {
			throw new Error('Thread content not fetched');
		}
	}

	// TODO static or move to the thread class
	// threadHasLabels(thread: google.gmail.v1.Thread, labels: strings[]) {}
		// if not @gmail.is 'LabelsFetched'
		// 	throw new Error
		// for msg in thread.messages
		// 	for label_id in msg.labelIds

	async req<A,T,T2>(method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: true): Promise<{0:T,1:T2} | null>;
	async req<A,T>(method: (arg: A, cb: (err: any, res: T) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: false): Promise<T | null>;
	async req<A,T>(method: (arg: A, cb: (err: any, res: T) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: boolean): Promise<any> {
		return returnArray
			? this.sync.req(method, params, abort, true)
			: this.sync.req(method, params, abort, false)
	}
}


export { Gmail, States };
