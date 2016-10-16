import States from './task-list-sync-states';
// TODO loose
import timestamp from 'internet-timestamp';
// TODO loose
import ago from 'ago';
import * as moment from 'moment';
import { EventEmitter } from 'events';
import { Gmail } from './gmail'
import { Sync } from './sync'
import { GmailQuery } from './gmail-query'
import { IListConfig } from '../types'


// TODO check if needed
export interface ITasks {
	'etag': string;
	'items': google.tasks.v1.Task[];
	'kind': string;
	'nextPageToken': string;
}

class TaskListSync extends EventEmitter {

	data: IListConfig;
	name: string;
//  @defineType 'data',
	list: google.tasks.v1.TaskList;

	tasks_api: google.tasks.v1.Tasks;

	states: States;

	tasks: ITasks | null;
	tasks_completed: google.tasks.v1.Tasks;
	// TODO set
	tasks_completed_from: string;
	threads = null;

	push_dirty: boolean;
	last_sync_start: number;
	last_sync_end: number | null;
	last_sync_time: number | null;

	sync: Sync;
	query: GmailQuery;
	etags: {
		tasks: string | null,
		tasks_completed: string | null
	} = { 
		tasks: null,
		tasks_completed: null
	};
	completions_tasks = new Map<string, {
		completed: boolean,
		time: moment.Moment,
		thread_id: string | null
	}>();
	quota_exceeded = false;

	def_title: string;
	// tasks_in_threads;
	gmail: Gmail;
	gmail_api: google.gmail.v1.Gmail;


	constructor(name: string, data: IListConfig, sync: Sync) {
		super()
		this.name = name;
		this.data = data;
		this.sync = sync;
		// this.defineType('list', ITaskList, 'ITaskList');
		// this.defineType('labels', [ILabel], '[ILabel]');
		this.states = new States(this)
		if (process.env['DEBUG']) {
			this.states.id(`TaskList ${name}`)
				.logLevel(process.env['DEBUG'])
			global.am_network.addMachine(this.states)
		}
		this.gmail_api = this.sync.gmail_api;
		this.gmail = this.sync.gmail;
		this.tasks_api = this.sync.tasks_api;
		// this.tasks_in_threads = [];
		this.last_sync_time = null;
		this.query = this.sync.gmail.createQuery(this.data.query, name, true);
		// bind to query states
		this.query.states.pipe('ThreadsFetched', this.states);
		this.query.states.pipe('MsgsFetched', this.states);
		this.states.pipe('Enabled', this.query.states);
	}


	// ----- -----
	// Transitions
	// ----- -----


	Restart_state() { return this.states.add('Syncing'); }

	Syncing_state() {
		this.push_dirty = false;
		// TODO define in the prototype
		this.last_sync_start = Date.now()
		this.last_sync_end = null;
		return this.last_sync_time = null;
	}


	Synced_state() {
		if (this.push_dirty) { this.states.add(this.sync.states, 'Dirty'); }
		this.last_sync_end = Date.now()
		this.last_sync_time = this.last_sync_end - this.last_sync_start;
		return console.log(`TaskList ${this.name} synced in: ${this.last_sync_time}ms`);
	}


	async SyncingThreadsToTasks_state() {
		let abort = this.states.getAbort('SyncingThreadsToTasks');
		await Promise.all(this.query.threads.map(async (thread) => {

			let task = this.getTaskForThread(thread.id)
			if (task) {
				let task_completed = this.taskWasCompleted(task.id)
				let thread_not_completed = this.query.threadWasNotCompleted(thread.id)
				if (task_completed && thread_not_completed &&
						task_completed.unix() < thread_not_completed.unix()) {
					//await @uncompleteTask task.id, abort
					// TODO await
					this.uncompleteTask(task.id, abort)
				}
					
				return;
			}
				
			// checks if there was a task for this thread in this list
			// somewhere in the past
			let task_id = this.getTaskForThreadFromCompletions(thread.id);
			if (task_id) {
				this.completeThread(thread.id);
				return delete this.completions_tasks[task_id];
			} else {
				let find = this.sync.findTaskForThread(thread.id)
				let task = find[0]
				let list_sync = find[1]
				// try to "move" the task from another list
				// TODO extract to a method
				if (task && list_sync) {
					console.log(`Moving task \"${task.title}\"`);
					// mark current instance as deleted
					task.deleted = true;
					let promises = [
						list_sync.deleteTask(task.id),
						this.createTask({
							title: task.title,
							notes: task.notes
						} as google.tasks.v1.Task)
					];
					// TODO await Promise.all promises
					return Promise.all(promises);
				} else {
					// TODO await @createTaskFromThread thread, abort
					return this.createTaskFromThread(thread, abort);
				}
			}
		}));

		if (abort())
			return
		// TODO merge?
		this.states.add('ThreadsToTasksSynced');
		this.states.add('Synced');
	};


	async SyncingTasksToThreads_state() {
		let abort = this.states.getAbort('SyncingTasksToThreads');

		// TODO assert?
		if (!this.tasks)
			return

		// loop over non completed tasks
		await Promise.all(this.tasks.items.map(async (task) => {
			// TODO support children tasks
			if (!task.title || task.parent) { return; }

			let thread_id = this.taskLinkedToThread(task);
			 // TODO support tasks moved from other lists
			if (thread_id) {
				let thread_completed = this.query.threadWasCompleted(thread_id);
				let task_not_completed = this.taskWasNotCompleted(task.id);
				if (!(this.query.threadSeen(thread_id)) || (
						thread_completed && task_not_completed && 
						thread_completed.unix() < task_not_completed.unix())) {
					// TODO await @uncompleteThread thread_id, abort
					return this.uncompleteThread(thread_id, abort);
				}
			} else {
				// TODO await @createThreadForTask task, abort
				return this.createThreadForTask(task, abort);
			}
		}));

		if (abort())
			return

		this.states.add('TasksToThreadsSynced');
		this.states.add('Synced');
	};


	async SyncingCompletedThreads_state() {
		let abort = this.states.getAbort('SyncingCompletedThreads');

		await Promise.all(this.query.completions
				.entries().map( async (completion) => {
			let [thread_id, row] = completion
			if (!row.completed) { return; }
			let task = this.getTaskForThread(thread_id);
			if (!task) { return; }
			let task_not_completed = this.taskWasNotCompleted(task.id);
			if (task_not_completed &&
					row.time.unix() > task_not_completed.unix() &&
					// TODO possible race condition
					!task.deleted) {
				// TODO await @completeTask task.id, abort
				this.completeTask(task.id, abort);
			}})
		)

		if (abort())
			return

		this.states.add('CompletedThreadsSynced')
		this.states.add('Synced')
	};


	async SyncingCompletedTasks_state() {
		let abort = this.states.getAbort('SyncingCompletedTasks');

		// TODO completions_tasks to Map
		await Promise.all(this.completions_tasks.entries().map(async (entry) => {
			let [task_id, row] = entry
			if (!row.completed)
				return
			let task = this.getTask(task_id);
			if (!task)
				return
			let thread_id = this.taskLinkedToThread(task);
			if (!thread_id)
				return
			let thread_not_completed = this.query.threadWasNotCompleted(thread_id);
			if (thread_not_completed && row.time.unix() > thread_not_completed.unix())
				await this.completeThread(thread_id, abort)
		}));

		if (abort()) { return; }
		this.states.add('CompletedTasksSynced');
		return this.states.add('Synced');
	};


	async PreparingList_state() {
		let abort = this.states.getAbort('PreparingList')
		// create or retrive task list
		let list = this.sync.task_lists.find( list => list.title == this.name ) || null
		// TODO? move?
		// this.def_title = this.data.labels_in_title || this.sync.config.labels_in_title;
		if (!list) {
			list = await this.createTaskList(this.name, abort);
			// TODO assert the tick
			console.log(`Creating tasklist '${this.name}'`);
		}
		if (list) {
			this.list = list
			this.states.add('ListReady')
		}
	};


	// TODO extract tasks fetching logic, reuse
	async FetchingTasks_state() {
		let abort = this.states.getAbort('FetchingTasks');
		let previous_ids = this.getAllTasks().map(task => task.id);
		// fetch all non-completed and max 2-weeks old completed ones
		// TODO use moment module to date operations
		if (!this.tasks_completed_from || this.tasks_completed_from < ago(3, "weeks")) {
			this.tasks_completed_from = ago(2, "weeks");
		}
		await this.fetchNonCompletedTasks(abort);
		if (abort())
			return

		if (!this.etags.tasks_completed || !this.states.is('TasksCached')) {
			await this.fetchCompletedTasks(abort);
			if (abort())
				return
		}

		this.processTasksDeletion(previous_ids);

		return this.states.add('TasksFetched');
	};

	// ----- -----
	// Methods
	// ----- -----

	// TODO remove from tasks collections
	async deleteTask(task_id: string, abort?: () => boolean): Promise<void> {
		await this.req(this.tasks_api.tasks.delete, {
			tasklist: this.list.id,
			task: task_id
		}, abort, false)
	}

	processTasksDeletion(previous_ids: string[]) {
		let current_ids = this.getAllTasks().map(task => task.id);
		for (let id of _.difference(previous_ids, current_ids)) {
			// time of completion is actually fake, but doesn't require a request
			this.completions_tasks.set(id, {
				completed: true,
				// TODO deleted flag
				time: moment(),
				thread_id: this.completions_tasks.get(id) && this.completions_tasks.get(id).thread_id
			})
		}
	}

	async fetchNonCompletedTasks(abort: () => boolean) {
		let response = await this.req(this.tasks_api.tasks.list, {
			tasklist: this.list.id,
			// fields: "etag,items(id,title,notes,updated,etag,status)",
			maxResults: '1000',
			showCompleted: false,
			// etag: this.etags.tasks
		}, abort, true)

		if (abort && abort() || !response)
			return

		if (response[1].statusCode === 304) {
			this.states.add('TasksCached');
			console.log(`[CACHED] tasks for '${this.name}'`);
		} else {
			console.log(`[FETCH] tasks for '${this.name}'`);
			// this.etags.tasks = response[1].headers.etag;
			this.etags.tasks = response[1].etag;
			if (!response[1].items)
				response[1].items = []
			for (let task of response[1].items) {
				this.completions_tasks[task.id] = {
					completed: false,
					time: moment(task.completed),
					thread_id: this.taskLinkedToThread(task)
				}
			}

			// return this.tasks = type(response[0], ITasks, 'ITasks');
			this.tasks = response[0]
		}
	}

	async fetchCompletedTasks(abort?: () => boolean): Promise<void> {
		let response = await this.req(this.tasks_api.tasks.list, {
			updatedMin: timestamp(new Date(this.tasks_completed_from)) as string,
			tasklist: this.list.id,
			fields: "etag,items(id,title,notes,updated,etag,status,completed)",
			// TODO config / paginate
			maxResults: '1000',
			showCompleted: true,
			etag: this.etags.tasks_completed || ''
		}, abort, true)

		if (!response)
			return

		if (response[1].statusCode === 304) {
			console.log(`[CACHED] completed tasks for '${this.name}'`);
		} else {
			console.log(`[FETCHED] completed tasks for '${this.name}'`)
			this.etags.tasks_completed = response[1].headers.etag;
			if (!response[0].items)
				response[0].items = []
			response[0].items = response[0].items.filter(item => item.status === 'completed')
			response[0].items.forEach(task => {
				this.completions_tasks[task.id] = {
					completed: true,
					time: moment(task.completed),
					thread_id: this.taskLinkedToThread(task)
				}
			})

			this.tasks_completed = response[0]
		}
	}

	async completeThread(id: string, abort?: () => boolean): Promise<void> {
		console.log(`Completing thread '${id}'`);
		await this.gmail.modifyLabels(id, [], this.uncompletedThreadLabels(), abort)
		this.push_dirty = true
		if (abort && abort())
			return
		this.query.completions.set(id, {
			completed: true,
			time: moment()
		})
	}

	async uncompleteThread(id: string, abort?: () => boolean): Promise<void> {
		console.log(`Un-completing thread '${id}'`);
		await this.gmail.modifyLabels(id, this.uncompletedThreadLabels(), [], abort)
		this.push_dirty = true
		if (abort && abort())
			return
		this.query.completions.set(id, {
			completed: false,
			time: moment()
		})
	}

	async createThreadForTask(task: google.tasks.v1.Task, abort?: () => boolean): Promise<void> {
		await this.gmail.createThread(
			this.gmail.createEmail(task.title), this.uncompletedThreadLabels(), abort
		);
		this.push_dirty = true;
	}

	// returns thread ID
	taskLinkedToThread(task: google.tasks.v1.Task): string | null {
		let match = task.notes && task.notes.match(/\bemail:\w+\b/)
		return match ? match[1] : null
	}

	async linkTaskToThread(task: google.tasks.v1.Task, thread_id: string,
			abort?: () => boolean): Promise<void> {
		if (!task.notes)
			task.notes = ""
		task.notes = `${task.notes}\nemail:${thread_id}`
		await this.req(this.tasks_api.tasks.patch, {
			tasklist: this.list.id,
			task: task.id,
			resource: {
				notes: task.notes}
		}, abort, true)
		if (abort && abort)
			return
		this.completions_tasks.get(task.id).thread_id = thread_id
		this.push_dirty = true;
	}
		// TODO update the DB
		//return if abort?()

	uncompletedThreadLabels(): string[] {
		let labels: string[] = []

		if (this.data.labels_new_task)
			labels.push(...this.data.labels_new_task)
		
		let config = this.sync.config.tasks.queries
		if (config && config.labels_defaults && config.labels_defaults.labels_new_task)
			labels.push(...config.labels_defaults.labels_new_task)

		return labels
	}


	async uncompleteTask(task_id: string, abort: () => boolean): Promise<void> {
		console.log(`Un-completing task ${task_id}`);
		await this.req(this.tasks_api.tasks.patch, {
				tasklist: this.list.id,
				task: task_id,
				resource: {
					status: 'needsAction',
					completed: null
				}
			}, abort, false);
		this.push_dirty = true;
		if (abort && abort())
			return
		// TODO update the task in the db
		let task = this.completions_tasks.get(task_id)
		this.completions_tasks.set(task_id, {
			completed: false,
			time: moment(),
			thread_id: task && task.thread_id
		});
	};


	async completeTask(task_id: string, abort?: () => boolean): Promise<void> {
		console.log(`Completing task ${task_id}`);
		await this.req(this.tasks_api.tasks.patch, {
				tasklist: this.list.id,
				task: task_id,
				resource: {
					status: 'completed'
				}
			}, abort, false)
		this.push_dirty = true;
		if (abort && abort())
			return
		// TODO update the task in the db
		let task = this.completions_tasks.get(task_id)
		this.completions_tasks.set(task_id, {
			completed: true,
			time: moment(),
			thread_id: task && task.thread_id
		})
	};


	getAllTasks(): google.tasks.v1.Task[] {
		if (!this.tasks || !this.tasks.items)
			return []
		return this.tasks.items.concat(this.tasks_completed && this.tasks_completed.items || [])
	}


	async fetchThreadForTask(task: google.tasks.v1.Task, abort?: () => boolean) {
		let thread_id = task.notes && task.notes.match(/\bemail:(\w+)\b/)
		if (thread_id)
			return await this.gmail.fetchThread(thread_id[1], null, abort)
		return null
	};


	async req<A,T,T2>(method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: true): Promise<{0:T,1:T2} | null>;
	async req<A,T>(method: (arg: A, cb: (err: any, res: T) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: false): Promise<T | null>;
	async req<A,T>(method: (arg: A, cb: (err: any, res: T) => void) => void, params: A, abort: (() => boolean) | null | undefined, returnArray: boolean): Promise<any> {
		try {
			if (returnArray)
				return await this.sync.req(method, params, abort, true)
			else
				return await this.sync.req(method, params, abort, false)
		} catch (err) {
			// catch quote exceeded exceptions only
			if (err.code !== 403)
				throw err
			this.quota_exceeded = true;
			// wait 0.5sec
			// TODO rewrite
			setTimeout((this.emit.bind(this, 'retry-requests')), 500)
			while (this.quota_exceeded)
				await new Promise(resolve => this.once('retry-requests', resolve))

			if (returnArray)
				return await this.sync.req(method, params, abort, true)
			else
				return await this.sync.req(method, params, abort, false)
		}
	}


	// TODO abort
	async syncTaskName(task: google.tasks.v1.Task, thread: google.gmail.v1.Thread): Promise<void> {
		let title = this.getTaskTitleFromThread(thread);
		if (task.title !== title) {
			console.log(`Updating task title to \"${title}\"`);
			// TODO use etag
			await this.req(this.tasks_api.tasks.patch, {
					tasklist: this.list.id,
					task: task.id,
					resource: {
						title
					}
				}, null, false)
			// TODO assign the new task? that would update the etag
			task.title = title;
			this.push_dirty = true;
		}
	}


	async createTaskList(name: string, abort?: () => boolean): Promise<google.tasks.v1.TaskList | null> {
		return await this.req(this.tasks_api.tasklists.insert, {
			resource: { title: name } }, abort, false);
	}


	async createTaskFromThread(thread: google.gmail.v1.Thread, abort?: () => boolean):
			Promise<google.tasks.v1.Task | null> {

		let title = this.getTaskTitleFromThread(thread);
		console.log(`Adding task '${title}'`);
		let res = await this.req(this.tasks_api.tasks.insert, {
				tasklist: this.list.id,
				resource: {
					title,
					notes: `email:${thread.id}`
				}
			}, abort, false)
		this.push_dirty = true;
		if (abort && abort())
			return null
		// TODO update the db

		return res
	}


	async createTask(task: google.tasks.v1.Task, abort?: () => boolean): 
			Promise<google.tasks.v1.Task | null> {
		console.log(`Adding task '${task.title}'`);
		let res = await this.req(this.tasks_api.tasks.insert, {
				tasklist: this.list.id,
				resource: task
			}, abort, false)
		this.push_dirty = true
		if (abort && abort())
			return null
		
		// TODO update the db

		return res
	}

	getTask(task_id: string) {
		return this.getAllTasks().find(task => task.id === task_id);
	}

	getTaskForThread(thread_id: string) {

		return this.getAllTasks().find(task => Boolean(
			task.notes && task.notes.match(`email:${thread_id}`)))
	}

	getTaskTitleFromThread(thread: google.gmail.v1.Thread) {
		// TODO use the snippet when no title available
		let title = this.gmail.getTitleFromThread(thread) || '[notitle]'
		// TODO clenup
		//		return title if not @sync.config.def_title

//		console.dir thread.messages
//		console.dir thread.messages[0].payload.headers
		let result = this.getLabelsFromTitle(title)
		title = result[0]
		let labels = result[1]
		// TODO add labels from the thread
		// remove labels defining this query list
		if (this.data && this.data.labels_new_task) {
			for (let label of this.data.labels_new_task) {
				labels = _.without(labels, label);
			}
		}

		// encode auto labels again, for readability

		if (this.sync.config.tasks.labels_in_title === 1) {
			return labels.concat(title).join(' ');
		} else {
			return [title].concat(labels).join(' ');
		}
	}

	// TODO move to the gmail class
	getLabelsFromTitle(title: string): {0: string, 1: string[]} {

		let labels: string[] = [];
		for (let r of this.sync.config.auto_labels) {
			let {
				symbol,
				label,
				prefix
			} = r;
			var name = r.shortcut ? r.shortcut : "\\w+";
			title = title.replace(new RegExp(`\b${symbol}(${name})\b`), name => {
				labels.push(prefix + (label || name))
				return ''
			});
		}
		title = title.trim();

		return [title, labels];
	}

	// this is a marvelous method's name...
	getTaskForThreadFromCompletions(thread_id: string): string | null {
		for (let [task_id, completion] of this.completions_tasks) {
			if (completion.thread_id === thread_id)
				return task_id
		}
		return null
	}

	taskWasCompleted(id: string) {
		if (this.completions_tasks.get(id) && this.completions_tasks.get(id).completed === true) {
			return this.completions_tasks.get(id).time;
		}
		return null
	}

	taskWasNotCompleted(id: string): moment.Moment | null {
		if (this.completions_tasks.get(id) && this.completions_tasks.get(id).completed === false) {
			return this.completions_tasks.get(id).time;
		}
		return null
	}
}


export default TaskListSync;
