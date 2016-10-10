/// <reference path="../../node_modules/google-api-nodejs-tsd/dist/googleapis.gmail.v1/googleapis.gmail.v1.d.ts" />

import AsyncMachine from 'asyncmachine';
import { GmailQuery } from './gmail-query';


class States extends AsyncMachine {


	Enabled = {};
	SyncingEnabled = {};


	Dirty = {
		blocks: ['QueryLabelsSynced', 'SyncingQueryLabels']
	};


	SyncingQueryLabels = {
		auto: true,
		requires: ['SyncingEnabled', 'LabelsFetched'],
		blocks: ['QueryLabelsSynced']
	};
	QueryLabelsSynced = {
		blocks: ['SyncingQueryLabels']
	};


	FetchingLabels = {
		auto: true,
		requires: ['Enabled'],
		blocks: ['LabelsFetched']
	};
	LabelsFetched = {
		blocks: ['FetchingLabels']
	};


	FetchingHistoryId = {
		auto: true,
		requires: ['Enabled'],
		blocks: ['HistoryIdFetched']
	};
	HistoryIdFetched = {
		blocks: ['FetchingHistoryId']
	};
}



class Gmail {


	states = null;
	api: google.gmail.v1.Gmail = null;
	config = null;
	sync = null;
	completions = null;
	history_id_timeout = 3000;
	history_id = null;
	last_sync_time = null;
	query_labels = null;
	queries = null;
	query_labels_timer = null;
	labels: google.gmail.v1.Label[];


	constructor(sync) {
		this.sync = sync;
		this.states = new States;
		this.states.setTarget(this);
		if (process.env['DEBUG']) {
			this.states.debug('Gmail / ', process.env['DEBUG']);
		}

		this.completions = {};
		this.queries = [];
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
		this.query_labels_timer = new Date();
		let abort = this.states.getAbort('SyncingQueryLabels');

		let dirty = false;
		await Promise.all(this.query_labels.map(async function(query, name) {

			query.states.add('Enabled');
			// TODO await query.states.whenOnce 'ThreadsFetched'
			query.states.whenOnce('ThreadsFetched');
			if (abort()) { return; }
			query.states.drop('Enabled');

			let labels = this.config.query_labels[name];
			// TODO await Promise.all query.threads.map coroutine (thread) =>
			return Promise.all(query.threads.map(function(thread) {
				// TODO await @modifyLabels thread.id, labels[0], labels[1], abort
				this.modifyLabels(thread.id, labels[0], labels[1], abort);
				return dirty = true;
			})
			)
		}))
		if (dirty) { this.states.add('Dirty'); }
		if (__guardFunc__(abort, f => f())) { return; }

		if (!dirty) {
			return this.states.add('QueryLabelsSynced');
		}
	};


	// TODO extract to a separate class
	QueryLabelsSynced_state() {
		this.last_sync_time = Date.now() - this.query_labels_timer;
		this.query_labels_timer = null;
		return console.log(`QueryLabels synced in: ${this.last_sync_time}ms`);
	}


	async FetchingLabels_state() {
		let abort = this.states.getAbort('FetchingLabels');
		let res = await this.req(this.api.users.labels.list, {userId: 'me'});
		if (__guardFunc__(abort, f => f())) { return; }
		this.labels = res[0].labels;
		return this.states.add('LabelsFetched');
	};


	Dirty_state() {
		this.history_id = null;
		for (let i = 0; i < this.queries.length; i++) {
			let query = this.queries[i];
			this.states.add(query.states, 'Dirty');
		}

		return this.states.drop('Dirty');
	}


	async FetchingHistoryId_state(abort) {
		console.log('[FETCH] history ID');
		let response = await this.req(this.api.users.getProfile, {
			userId: 'me',
			fields: 'historyId'
		}
		);
		if (__guardFunc__(abort, f => f())) { return; }
		this.history_id = response[0].historyId;
		this.last_sync_time = Date.now();
		return this.states.add('HistoryIdFetched');
	};


	// ----- -----
	// Methods
	// ----- -----


	async fetchThread(id, historyId, abort) {
		let response = await this.req(this.api.users.threads.get, {
			id,
			userId: 'me',
			metadataHeaders: 'SUBJECT',
			format: 'metadata',
			fields: 'id,historyId,messages(id,labelIds,payload(headers))'
		}
		);
		if (__guardFunc__(abort, f => f())) { return; }

		return response[0];
	}


	createQuery(query, name = '', fetch_msgs = false) {
		query = new GmailQuery(this, query, name, fetch_msgs);
		this.queries.push(query);

		return query;
	}


	// Searches all present gmail queries for the thread with the given ID.
	getThread(id, with_content = false) {
		for (let i = 0; i < this.queries.length; i++) {
			let query = this.queries[i];
			for (let j = 0; j < query.threads.length; j++) {
				let thread = query.threads[j];
				if (thread.id !== id) { continue; }
				if (with_content && !__guard__(thread.messages, x => x.length)) { continue; }
				return thread;
			}
		}
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
			if (__guard__(labels[1], x => x.length)) { // labels to add
				exclusive_query += ' (label:' +
					labels[1].map(this.normalizeLabelName).join(' OR label:') + ')';
			}
			this.query_labels[query] = this.createQuery(exclusive_query, `QueryLabels ${++count}`);
		}

		return this.sync.log(`Initialized ${this.query_labels.keys().length} queries`, 2);
	}


	normalizeLabelName(label) {
		return label
			.replace('/', '-')
			.replace(' ', '-')
			.toLowerCase();
	}


	isHistoryIdValid() {
		return this.history_id && Date.now() < this.last_sync_time + this.history_id_timeout;
	}


	async isCached(history_id, abort) {
		if (!this.isHistoryIdValid()) {
			if (!this.states.is('FetchingHistoryId')) {
				this.states.add('FetchingHistoryId', abort);
				// We need to wait for FetchingHistoryId being really added, not only queued
				await this.states.whenOnce('FetchingHistoryId', abort);
				if (__guardFunc__(abort, f => f())) { return; }
			}
			await this.states.whenOnce('HistoryIdFetched', abort);
			if (__guardFunc__(abort, f1 => f1())) { return; }
		}

		return this.history_id <= history_id;
	};


	initAutoLabels() {}
//		for query, labels of @config.query_labels
//			query = new GmailQuery this, query, no


	getLabelsIds(labels) {
		if (!Array.isArray(labels)) {
			labels = [labels];
		}

		return labels.map(name => {
			let label = this.labels.find(label => label.name.toLowerCase() === name.toLowerCase());
			return label.id;
		}
		);
	}


	async modifyLabels(thread_id, add_labels, remove_labels, abort) {
		if (typeof add_labels === 'undefined' || add_labels === null) { add_labels = []; }
		if (typeof remove_labels === 'undefined' || remove_labels === null) { remove_labels = []; }
		let add_label_ids = this.getLabelsIds(add_labels);
		let remove_label_ids = this.getLabelsIds(remove_labels);

		let label = (() => { try {
			let thread = this.getThread(thread_id, true);
			return `"${this.getTitleFromThread(thread)}"`;
		} catch (e) {
			return `ID: ${thread_id}`;
		} })();

		let log_msg = `Modifing labels for thread ${label} `;
		if (add_labels.length) {
			log_msg += `+(${add_labels.join(' ')}) `;
		}
		if (remove_labels.length) {
			log_msg += `-(${remove_labels.join(' ')})`;
		}
		console.log(log_msg);

		return await this.req(this.api.users.threads.modify, {
			id: thread_id,
			userId: 'me',
			fields: 'id',
			resource: {
				addLabelIds: add_label_ids,
				removeLabelIds: remove_label_ids
			}
		}
		);
	};

		// TODO
//    # sync the DB
//    thread = @threads?.threads?.find (thread) ->
//      thread.id is thread_id
//    return if not thread
//
//    for msg in thread.messages
//      msg.labelIds = msg.labelIds.without.apply msg.labelIds, remove_label_ids
//      msg.labelIds.push add_label_ids


	async getHistoryId(abort) {
		if (!this.history_id) {
			this.states.add('FetchingHistoryId');
			await this.states.whenOnce('HistoryIdFetched');
		}

		return this.history_id;
	};


	async createThread(raw_email, labels, abort) {
		console.log(`Creating thread (${labels.join(' ')})`);
		let res = await this.req(this.api.users.messages.insert, {
			userId: 'me',
			resource: {
				raw: raw_email,
				labelIds: this.getLabelsIds(labels)
			}
		}
		);
		if (__guardFunc__(abort, f => f())) { return; }
		this.states.add('Dirty', labels);
		return res[0];
	};


	createEmail(subject) {
			let email = [`From: ${this.sync.config.gmail_username} <${this.sync.config.gmail_username}>s`,
							 `To: ${this.sync.config.gmail_username}`,
							 "Content-type: text/html;charset=utf-8",
							 "MIME-Version: 1.0",
							 `Subject: ${subject}`].join("\r\n");

			return new Buffer(email)
				.toString('base64')
				.replace(/\+/g, '-')
				.replace(/\//g, '_');
		}


	// TODO static or move to the thread class
	getTitleFromThread(thread) {
		try { return thread.messages[0].payload.headers[0].value; }
		catch (e) {
			throw new Error('Thread content not fetched');
		}
	}


	// TODO static or move to the thread class
	threadHasLabels(thread, labels) {}
//    if not @gmail.is 'LabelsFetched'
//      throw new Error
//    for msg in thread.messages
//      for label_id in msg.labelIds


	req(method, params) {
		return this.sync.req(method, params);
	}
}



export { Gmail, States };
function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}