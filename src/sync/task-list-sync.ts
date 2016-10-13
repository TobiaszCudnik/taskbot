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

export interface IListConfig {
	labels_in_title: boolean,
	query: string,
	labels_new_task?: string[]
}

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
//  @defineType 'tasks_api', [ITask], '[ITask]'

	states: States;
//  @defineType 'states', QueryStates, 'QueryStates'

	tasks: ITasks | null;
	tasks_completed = null;
	tasks_completed_from = null;
	threads = null;

	push_dirty: boolean;
	last_sync_start: number;
	last_sync_end: number | null;
	last_sync_time: number | null;

//	@defineType 'completions_threads', [typedef {
//		type: String, time: Object
//	}], '[{completed: Boolean, time: Object}]'
//	@defineType 'completions_tasks', [typedef {
//		type: String, time: Object
//	}], '[{completed: Boolean, time: Object}]'

	sync: Sync;
	query: GmailQuery;
	etags: {
		tasks: string | null,
		tasks_completed: string | null
	} = { 
		tasks: null,
		tasks_completed: null
	};
	completions_tasks: { [task_id: string]: {
		completed: boolean,
		time: moment.Moment,
		thread_id: string | null
	}};
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
		this.states = new States;
		this.states.setTarget(this);
		if (process.env['DEBUG']) {
			this.states.id('TaskList')
				.logLevel(process.env['DEBUG'])
		}
		this.gmail_api = this.sync.gmail_api;
		this.gmail = this.sync.gmail;
		this.tasks_api = this.sync.tasks_api;
		// this.tasks_in_threads = [];
		this.completions_tasks = {};
		this.last_sync_time = null;
		this.query = this.sync.gmail.createQuery(this.data.query, 'TaskList', true);
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

			let task = this.getTaskForThread(thread.id);
			if (task) {
				let task_completed = this.taskWasCompleted(task.id);
				let thread_not_completed = this.query.threadWasNotCompleted(thread.id);
				if (task_completed &&
						task_completed.unix() < thread_not_completed.unix()) {
					//await @uncompleteTask task.id, abort
					// TODO await
					this.uncompleteTask(task.id, abort);
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
				let list_sync;
				[task, list_sync] = this.sync.findTaskForThread(thread.id);
				// try to "move" the task from another list
				// TODO extract to a method
				if (task) {
					console.log(`Moving task \"${task.title}\"`);
					// mark current instance as deleted
					task.deleted = true;
					let promises = [
						list_sync.deleteTask(task.id),
						this.createTask({
							title: task.title,
							notes: task.notes
						})
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
				if (!(this.query.threadSeen(thread_id)) || (thread_completed &&
						thread_completed.unix() < task_not_completed.unix())) {
					// TODO await @uncompleteThread thread_id, abort
					return this.uncompleteThread(thread_id, abort);
				}
			} else {
				// TODO await @createThreadForTask task, abort
				return this.createThreadForTask(task, abort);
			}
		}));

		if (abort()) { return; }
		this.states.add('TasksToThreadsSynced');
		return this.states.add('Synced');
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
				}
			})
		);

		if (abort()) { return; }
		this.states.add('CompletedThreadsSynced');
		return this.states.add('Synced');
	};


	async SyncingCompletedTasks_state() {
		let abort = this.states.getAbort('SyncingCompletedTasks');

		await Promise.all(this.completions_tasks.map(async (row, task_id) => {
			if (!row.completed) { return; }
			let task = this.getTask(task_id);
			if (!task) { return; }
			let thread_id = this.taskLinkedToThread(task);
			let thread_not_completed = this.query.threadWasNotCompleted(thread_id);
			if (thread_not_completed && row.time.unix() > thread_not_completed.unix()) {
				// TODO await @completeThread thread_id, abort
				return this.completeThread(thread_id, abort);
			}
		}));

		if (abort()) { return; }
		this.states.add('CompletedTasksSynced');
		return this.states.add('Synced');
	};


	async PreparingList_state() {
		let abort = this.states.getAbort('PreparingList');
		let list = null;

		// TODO? move?
		this.def_title = this.data.labels_in_title || this.sync.config.labels_in_title;

		// create or retrive task list
		for (let i = 0; i < this.sync.task_lists.length; i++) {
			let r = this.sync.task_lists[i];
			if (this.name === r.title) {
				list = r;
				break;
			}
		}

		if (!list) {
			list = await this.createTaskList(this.name, abort);
			// TODO assert the tick
			console.log(`Creating tasklist '${this.name}'`);
		}

		this.list = list
		return this.states.add('ListReady');
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
	async deleteTask(task_id: string, abort: () => boolean): Promise<void> {
		await this.req(this.tasks_api.tasks.delete, {
			tasklist: this.list.id,
			task: task_id
		});
	};


	processTasksDeletion(previous_ids: string[]) {
		let current_ids = this.getAllTasks().map(task => task.id);
		for (let id of _.difference(previous_ids, current_ids)) {
			// time of completion is actually fake, but doesn't require a request
			this.completions_tasks[id] = {
				completed: true,
				// TODO deleted flag
				time: moment(),
				thread_id: __guard__(this.completions_tasks[id], x => x.thread_id)
			}
		}
	}


	async fetchNonCompletedTasks(abort: () => boolean) {
		let response = await this.req(this.tasks_api.tasks.list, {
			tasklist: this.list.id,
			fields: "etag,items(id,title,notes,updated,etag,status)",
			maxResults: 1000,
			showCompleted: false,
			etag: this.etags.tasks
		})

		if (abort && abort())
			return

		if (response[1].statusCode === 304) {
			this.states.add('TasksCached');
			console.log(`[CACHED] tasks for '${this.name}'`);
		} else {
			console.log(`[FETCH] tasks for '${this.name}'`);
			// this.etags.tasks = response[1].headers.etag;
			this.etags.tasks = response.etag;
			if (!response.items)
				response.items = []
			for (let task of response.items) {
				this.completions_tasks[task.id] = {
					completed: false,
					time: moment(task.completed),
					thread_id: this.taskLinkedToThread(task)
				}
			}

			// return this.tasks = type(response[0], ITasks, 'ITasks');
			this.tasks = response
		}
	};


	async fetchCompletedTasks(update_min, abort) {
		let response = await this.req(this.tasks_api.tasks.list, {
			updatedMin: timestamp(new Date(this.tasks_completed_from)),
			tasklist: this.list.id,
			fields: "etag,items(id,title,notes,updated,etag,status,completed)",
			maxResults: 1000,
			showCompleted: true,
			etag: this.etags.tasks_completed
		}
		);

		if (response[1].statusCode === 304) {
			return console.log(`[CACHED] completed tasks for '${this.name}'`);
		} else {
			console.log(`[FETCHED] completed tasks for '${this.name}'`);
			this.etags.tasks_completed = response[1].headers.etag;
			if (response[0].items == null) { response[0].items = []; }
			response[0].items = response[0].items.filter(item => item.status === 'completed');
			response[0].items.forEach(task => {
				return this.completions_tasks[task.id] = {
					completed: true,
					time: moment(task.completed),
					thread_id: this.taskLinkedToThread(task)
				};
			}
			);

			// return this.tasks_completed = type(response[0], ITasks, 'ITasks');
			return this.tasks.completed
		}
	};


	async completeThread(id: string, abort?: () => boolean): Promise<void> {
		console.log(`Completing thread '${id}'`);
		await this.gmail.modifyLabels(id, [], this.uncompletedThreadLabels(), abort)
		this.push_dirty = true
		if (abort && abort())
			return
		this.query.completions[id] = {
			completed: true,
			time: moment()
		}
	};


	async uncompleteThread(id: string, abort?: () => boolean): Promise<void> {
		console.log(`Un-completing thread '${id}'`);
		await this.gmail.modifyLabels(id, this.uncompletedThreadLabels(), [], abort)
		this.push_dirty = true
		if (abort && abort())
			return
		this.query.completions[id] = {
			completed: false,
			time: moment()
		}
	};


	async createThreadForTask(task: google.tasks.v1.Task, abort?: () => boolean): Promise<void> {
		await this.gmail.createThread(
			this.gmail.createEmail(task.title), this.uncompletedThreadLabels(), abort
		);
		this.push_dirty = true;
	};


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
		})
		if (abort && abort)
			return
		this.completions_tasks[task.id].thread_id = thread_id
		this.push_dirty = true;
	};
		// TODO update the DB
		//return if abort?()


	uncompletedThreadLabels(): string[] {
		let labels: string[] = []

		if (this.data.labels_new_task)
			labels.push(...this.data.labels_new_task)
		
		let config = this.sync.config.tasks.queries
		if (config && config.labels_defaults)
			labels.push(...config.labels_defaults.labels_new_task)

		return labels
	}


	async uncompleteTask(task_id: string, abort: () => boolean) {
		console.log(`Un-completing task ${task_id}`);
		await this.req(this.tasks_api.tasks.patch, {
			tasklist: this.list.id,
			task: task_id,
			resource: {
				status: 'needsAction',
				completed: null
			}, abort});
		this.push_dirty = true;
		if (abort && abort())
			return
		// TODO update the task in the db
		return this.completions_tasks[task_id] = {
			completed: false,
			time: moment(),
			thread_id: __guard__(this.completions_tasks[task_id], x => x.thread_id)
		};
	};


	async completeTask(task_id: string, abort?: () => boolean) {
		console.log(`Completing task ${task_id}`);
		await this.req(this.tasks_api.tasks.patch, {
			tasklist: this.list.id,
			task: task_id,
			resource: {
				status: 'completed'
			}
		}
		);
		this.push_dirty = true;
		if (abort && abort())
			return
		// TODO update the task in the db
		let task = this.completions_tasks[task_id]
		return this.completions_tasks[task_id] = {
			completed: true,
			time: moment(),
			thread_id: task && task.thread_id
		};
	};


	getAllTasks() {
		if (!this.tasks || !this.tasks.items))
			return []
		return this.tasks.items.concat(__guard__(this.tasks_completed, x1 => x1.items) || []);
	}


	async fetchThreadForTask(task, abort) {
		let thread_id = (__guard__(task.notes, x => x.match(/\bemail:(\w+)\b/)))[1];
		return await this.fetchThread(thread_id, null, abort);
	};


	async req(method, params) {
		try { return await this.sync.req.apply(this.sync, arguments); }
		catch (err) {
			// catch quote exceeded exceptions only
			if ((err.code != null) !== 403) { throw err; }
			this.quota_exceeded = true;
			// wait 0.5sec
			setTimeout((this.emit.bind(this, 'retry-requests')), 500);
			while (this.quota_exceeded) {
				await new Promise(resolve => {
					return this.once('retry-requests', resolve);
				}
				);
			}

			return await this.req(method, params);
		}
	}


	// TODO abort
	async syncTaskName(task, thread) {
		let title = this.getTaskTitleFromThread(thread);
		if (task.title !== title) {
			console.log(`Updating task title to \"${title}\"`);
			// TODO use etag
			let res = await this.req(this.tasks_api.tasks.patch, {
				tasklist: this.list.id,
				task: task.id,
				resource: {
					title
				}
			}
			);
			task.title = title;
			return this.push_dirty = true;
		}
	}


	async createTaskList(name, abort) {
		let res = await this.req(this.tasks_api.tasklists.insert,
			{resource: { title: name } });
		return res[1].body
	}


	async createTaskFromThread(thread, abort) {

		let title = this.getTaskTitleFromThread(thread);
		console.log(`Adding task '${title}'`);
		let res = await this.req(this.tasks_api.tasks.insert, {
			tasklist: this.list.id,
			resource: {
				title,
				notes: `email:${thread.id}`
			}
		}
		);
		this.push_dirty = true;
		if (__guardFunc__(abort, f => f())) {
			return;
		}
		// TODO update the db

		return res[0]
	}


	async createTask(task, abort) {
		console.log(`Adding task '${task.title}'`);
		let res = await this.req(this.tasks_api.tasks.insert, {
			tasklist: this.list.id,
			resource: task
		}
		);
		this.push_dirty = true;
		if (abort && abort())
			return
		
		// TODO update the db

		// return type(res[0], ITask, 'ITask');
		return res[0]
	}


	getTask(task_id) {
		return this.getAllTasks().find(task => task.id === task_id);
	}


	getTaskForThread(thread_id) {

		return this.getAllTasks().find(task => __guard__(task.notes, x => x.match(`email:${thread_id}`)));
	}

//		type task, ITask, 'ITask'


	getTaskTitleFromThread(thread) {
		let labels;
		// type(thread, IThread, 'IThread');
		// TODO use the snippet when no title available
		let title = this.gmail.getTitleFromThread(thread) || '[notitle]';
		// TODO clenup
		//		return title if not @sync.config.def_title

//		console.dir thread.messages
//		console.dir thread.messages[0].payload.headers
		[title, labels] = this.getLabelsFromTitle(title);
		// TODO add labels from the thread
		// remove labels defining this query list
		for (let i = 0; i < this.data.labels_new_task.length; i++) {
			let label = this.data.labels_new_task[i];
			labels = labels.without(label);
		}

		// encode auto labels again, for readability

		if (this.sync.config.tasks.labels_in_title === 1) {
			return labels.concat(title).join(' ');
		} else {
			return [title].concat(labels).join(' ');
		}
	}


	/*
  TODO move to the gmail class
	@name string
	@return [ string, Array<Label> ]
	*/
	getLabelsFromTitle(title) {

		let labels = [];
		for (let i = 0; i < this.sync.config.auto_labels.length; i++) {
			let r = this.sync.config.auto_labels[i];
			let { symbol } = r;
			let { label } = r;
			let { prefix } = r;
			var name = r.shortcut ? r.shortcut : "\\w+";
			title = title.replace(`\b${symbol}(${name})\b`, '', name => labels.push(prefix + (label || name))
			);
		}
		title = title.trim();

		return [title, labels];
	}


	// this is a marvelous method's name...
	getTaskForThreadFromCompletions(thread_id) {
		for (let task_id in this.completions_tasks) {
			let completion = this.completions_tasks[task_id];
			if (completion.thread_id === thread_id) { return task_id; }
		}
	}
			

	taskWasCompleted(id) {
		if (__guard__(this.completions_tasks[id], x => x.completed) === true) {
			return this.completions_tasks[id].time;
		} else { return false; }
	}


	taskWasNotCompleted(id) {
		if (__guard__(this.completions_tasks[id], x => x.completed) === false) {
			return this.completions_tasks[id].time;
		} else { return false; }
	}
}


export default TaskListSync;
function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}