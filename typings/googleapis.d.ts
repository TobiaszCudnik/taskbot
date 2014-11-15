// Type definitions for Google API for Node.js library
// Project: https://github.com/google/google-api-nodejs-client
// Definitions by: vvakame <https://github.com/vvakame>
// Definitions: https://github.com/vvakame/gapidts

// https://github.com/google/google-api-nodejs-client#authorizing-and-authenticating

declare module googleapis {

	module google {
		interface Options {
			proxy?: string;
			auth: google.auth.OAuth2;
		}

		function options(options:Options):void;
	}

	module google.auth {
		interface OAuth2GenerateAuthUrlParams {
			access_type: string;
			scope: any; // string (space-delimited) or string[]
		}

		interface OAuth2Credentials {
			access_token: string;
			refresh_token: string;
		}

		class OAuth2 {
			constructor(clientId:string, clientSecret:string, redirectUrl:string);

			generateAuthUrl(params:OAuth2GenerateAuthUrlParams):string;

			getToken(code: string, callback:(err:any, tokens:OAuth2Credentials)=> void):void;

			refreshAccessToken(callback:(err:any, tokens:OAuth2Credentials)=> void):void;

			setCredentials(tokens:OAuth2Credentials):void;
		}
	}

	interface IErrorResponse {
		code?: number;
		errors?: any[];
		message?: string;
	}
}


// Type definitions for Google Tasks API v1
// Project: https://developers.google.com/google-apps/tasks/firstapp
// Definitions by: vvakame's gapidts <https://github.com/vvakame/gapidts>
// Definitions: https://github.com/vvakame/gapidts

// OAuth2 scopes
// https://www.googleapis.com/auth/tasks
//   Manage your tasks
// https://www.googleapis.com/auth/tasks.readonly
//   View your tasks

/// <reference path="./googleapis-nodejs-common.d.ts" />

declare module "googleapis" {
    function gmail(version:string):typeof googleapis.gmail;
    function gmail(opts: {version:string; auth?: googleapis.google.auth.OAuth2; }):typeof googleapis.gmail;
    function tasks(version:string):typeof googleapis.tasks;
    function tasks(opts: {version:string; auth?: googleapis.google.auth.OAuth2; }):typeof googleapis.tasks;
}
/**
 * Lets you manage your tasks and task lists.
 */
declare module googleapis.tasks {
    var tasklists: {
        /**
         * Deletes the authenticated user's specified task list.
         * @params {string} tasklist Task list identifier.
         */
        delete: (params: {
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
        /**
         * Returns the authenticated user's specified task list.
         * @params {string} tasklist Task list identifier.
         */
        get: (params: {
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: ITaskList, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Creates a new task list and adds it to the authenticated user's task lists.
         */
        insert: (params: {
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITaskList;
        }, callback: (err: IErrorResponse, response: ITaskList, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Returns all the authenticated user's task lists.
         * @params {string} maxResults Maximum number of task lists returned on one page. Optional. The default is 100.
         * @params {string} pageToken Token specifying the result page to return. Optional.
         */
        list: (params: {
            maxResults?: string;
            pageToken?: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: ITaskLists, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Updates the authenticated user's specified task list. This method supports patch semantics.
         * @params {string} tasklist Task list identifier.
         */
        patch: (params: {
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITaskList;
        }, callback: (err: IErrorResponse, response: ITaskList, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Updates the authenticated user's specified task list.
         * @params {string} tasklist Task list identifier.
         */
        update: (params: {
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITaskList;
        }, callback: (err: IErrorResponse, response: ITaskList, incomingMessage: any /* http.IncomingMessage */) => void) => void;
    };
    var tasks: {
        /**
         * Clears all completed tasks from the specified task list. The affected tasks will be marked as 'hidden' and no longer be returned by default when retrieving all tasks for a task list.
         * @params {string} tasklist Task list identifier.
         */
        clear: (params: {
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
        /**
         * Deletes the specified task from the task list.
         * @params {string} task Task identifier.
         * @params {string} tasklist Task list identifier.
         */
        delete: (params: {
            task: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
        /**
         * Returns the specified task.
         * @params {string} task Task identifier.
         * @params {string} tasklist Task list identifier.
         */
        get: (params: {
            task: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: ITask, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Creates a new task on the specified task list.
         * @params {string} parent Parent task identifier. If the task is created at the top level, this parameter is omitted. Optional.
         * @params {string} previous Previous sibling task identifier. If the task is created at the first position among its siblings, this parameter is omitted. Optional.
         * @params {string} tasklist Task list identifier.
         */
        insert: (params: {
            parent?: string;
            previous?: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITask;
        }, callback: (err: IErrorResponse, response: ITask, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Returns all tasks in the specified task list.
         * @params {string} completedMax Upper bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date.
         * @params {string} completedMin Lower bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date.
         * @params {string} dueMax Upper bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
         * @params {string} dueMin Lower bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
         * @params {string} maxResults Maximum number of task lists returned on one page. Optional. The default is 100.
         * @params {string} pageToken Token specifying the result page to return. Optional.
         * @params {boolean} showCompleted Flag indicating whether completed tasks are returned in the result. Optional. The default is True.
         * @params {boolean} showDeleted Flag indicating whether deleted tasks are returned in the result. Optional. The default is False.
         * @params {boolean} showHidden Flag indicating whether hidden tasks are returned in the result. Optional. The default is False.
         * @params {string} tasklist Task list identifier.
         * @params {string} updatedMin Lower bound for a task's last modification time (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by last modification time.
         */
        list: (params: {
            completedMax?: string;
            completedMin?: string;
            dueMax?: string;
            dueMin?: string;
            maxResults?: string;
            pageToken?: string;
            showCompleted?: boolean;
            showDeleted?: boolean;
            showHidden?: boolean;
            tasklist: string;
            updatedMin?: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: ITasks, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Moves the specified task to another position in the task list. This can include putting it as a child task under a new parent and/or move it to a different position among its sibling tasks.
         * @params {string} parent New parent task identifier. If the task is moved to the top level, this parameter is omitted. Optional.
         * @params {string} previous New previous sibling task identifier. If the task is moved to the first position among its siblings, this parameter is omitted. Optional.
         * @params {string} task Task identifier.
         * @params {string} tasklist Task list identifier.
         */
        move: (params: {
            parent?: string;
            previous?: string;
            task: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: ITask, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Updates the specified task. This method supports patch semantics.
         * @params {string} task Task identifier.
         * @params {string} tasklist Task list identifier.
         */
        patch: (params: {
            task: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITask;
        }, callback: (err: IErrorResponse, response: ITask, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        /**
         * Updates the specified task.
         * @params {string} task Task identifier.
         * @params {string} tasklist Task list identifier.
         */
        update: (params: {
            task: string;
            tasklist: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            resource?: ITask;
        }, callback: (err: IErrorResponse, response: ITask, incomingMessage: any /* http.IncomingMessage */) => void) => void;
    };
    interface ITask {
        /**
         * Completion date of the task (as a RFC 3339 timestamp). This field is omitted if the task has not been completed.
         */
        completed: string; // date-time
        /**
         * Flag indicating whether the task has been deleted. The default if False.
         */
        deleted: boolean;
        /**
         * Due date of the task (as a RFC 3339 timestamp). Optional.
         */
        due: string; // date-time
        /**
         * ETag of the resource.
         */
        etag: string;
        /**
         * Flag indicating whether the task is hidden. This is the case if the task had been marked completed when the task list was last cleared. The default is False. This field is read-only.
         */
        hidden: boolean;
        /**
         * Task identifier.
         */
        id: string;
        /**
         * Type of the resource. This is always "tasks#task".
         */
        kind: string;
        /**
         * Collection of links. This collection is read-only.
         */
        links: {
            description: string;
            link: string;
            type: string;
        }[];
        /**
         * Notes describing the task. Optional.
         */
        notes: string;
        /**
         * Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
         */
        parent: string;
        /**
         * String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the "move" method to move the task to another position.
         */
        position: string;
        /**
         * URL pointing to this task. Used to retrieve, update, or delete this task.
         */
        selfLink: string;
        /**
         * Status of the task. This is either "needsAction" or "completed".
         */
        status: string;
        /**
         * Title of the task.
         */
        title: string;
        /**
         * Last modification time of the task (as a RFC 3339 timestamp).
         */
        updated: string; // date-time
    }
    interface ITaskList {
        /**
         * ETag of the resource.
         */
        etag: string;
        /**
         * Task list identifier.
         */
        id: string;
        /**
         * Type of the resource. This is always "tasks#taskList".
         */
        kind: string;
        /**
         * URL pointing to this task list. Used to retrieve, update, or delete this task list.
         */
        selfLink: string;
        /**
         * Title of the task list.
         */
        title: string;
        /**
         * Last modification time of the task list (as a RFC 3339 timestamp).
         */
        updated: string; // date-time
    }
    interface ITaskLists {
        /**
         * ETag of the resource.
         */
        etag: string;
        /**
         * Collection of task lists.
         */
        items: ITaskList[];
        /**
         * Type of the resource. This is always "tasks#taskLists".
         */
        kind: string;
        /**
         * Token that can be used to request the next page of this result.
         */
        nextPageToken: string;
    }
    interface ITasks {
        /**
         * ETag of the resource.
         */
        etag: string;
        /**
         * Collection of tasks.
         */
        items: ITask[];
        /**
         * Type of the resource. This is always "tasks#tasks".
         */
        kind: string;
        /**
         * Token used to access the next page of this result.
         */
        nextPageToken: string;
    }
}

/**
 * The Gmail REST API.
 */
declare module googleapis.gmail {
    var users: {
        /**
         * Gets the current user's Gmail profile.
         * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
         */
        getProfile: (params: {
            userId: string;
            key?: string; // API_KEY
            auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
        }, callback: (err: IErrorResponse, response: IProfile, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        drafts: {
            /**
             * Creates a new draft with the DRAFT label.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            create: (params: {
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IDraft;
            }, callback: (err: IErrorResponse, response: IDraft, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Immediately and permanently deletes the specified draft. Does not simply trash it.
             * @params {string} id The ID of the draft to delete.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            delete: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
            /**
             * Gets the specified draft.
             * @params {string} format The format to return the draft in.
             * @params {string} id The ID of the draft to retrieve.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            get: (params: {
                format?: string;
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IDraft, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Lists the drafts in the user's mailbox.
             * @params {number} maxResults Maximum number of drafts to return.
             * @params {string} pageToken Page token to retrieve a specific page of results in the list.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            list: (params: {
                maxResults?: number;
                pageToken?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IListDraftsResponse, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Sends the specified, existing draft to the recipients in the To, Cc, and Bcc headers.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            send: (params: {
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IDraft;
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Replaces a draft's content.
             * @params {string} id The ID of the draft to update.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            update: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IDraft;
            }, callback: (err: IErrorResponse, response: IDraft, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        };
        history: {
            /**
             * Lists the history of all changes to the given mailbox. History results are returned in chronological order (increasing historyId).
             * @params {string} labelId Only return messages with a label matching the ID.
             * @params {number} maxResults The maximum number of history records to return.
             * @params {string} pageToken Page token to retrieve a specific page of results in the list.
             * @params {string} startHistoryId Required. Returns history records after the specified startHistoryId. The supplied startHistoryId should be obtained from the historyId of a message, thread, or previous list response. History IDs increase chronologically but are not contiguous with random gaps in between valid IDs. Supplying an invalid or out of date startHistoryId typically returns an HTTP 404 error code. A historyId is typically valid for at least a week, but in some circumstances may be valid for only a few hours. If you receive an HTTP 404 error response, your application should perform a full sync. If you receive no nextPageToken in the response, there are no updates to retrieve and you can store the returned historyId for a future request.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            list: (params: {
                labelId?: string;
                maxResults?: number;
                pageToken?: string;
                startHistoryId?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IListHistoryResponse, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        };
        labels: {
            /**
             * Creates a new label.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            create: (params: {
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: ILabel;
            }, callback: (err: IErrorResponse, response: ILabel, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Immediately and permanently deletes the specified label and removes it from any messages and threads that it is applied to.
             * @params {string} id The ID of the label to delete.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            delete: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
            /**
             * Gets the specified label.
             * @params {string} id The ID of the label to retrieve.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            get: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: ILabel, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Lists all labels in the user's mailbox.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            list: (params: {
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IListLabelsResponse, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Updates the specified label. This method supports patch semantics.
             * @params {string} id The ID of the label to update.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            patch: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: ILabel;
            }, callback: (err: IErrorResponse, response: ILabel, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Updates the specified label.
             * @params {string} id The ID of the label to update.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            update: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: ILabel;
            }, callback: (err: IErrorResponse, response: ILabel, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        };
        messages: {
            /**
             * Immediately and permanently deletes the specified message. This operation cannot be undone. Prefer messages.trash instead.
             * @params {string} id The ID of the message to delete.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            delete: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
            /**
             * Gets the specified message.
             * @params {string} format The format to return the message in.
             * @params {string} id The ID of the message to retrieve.
             * @params {string} metadataHeaders When given and format is METADATA, only include headers specified.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            get: (params: {
                format?: string;
                id: string;
                metadataHeaders?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Imports a message into only this user's mailbox, with standard email delivery scanning and classification similar to receiving via SMTP. Does not send a message.
             * @params {string} internalDateSource Source for Gmail's internal date of the message.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            import: (params: {
                internalDateSource?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IMessage;
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Directly inserts a message into only this user's mailbox similar to IMAP APPEND, bypassing most scanning and classification. Does not send a message.
             * @params {string} internalDateSource Source for Gmail's internal date of the message.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            insert: (params: {
                internalDateSource?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IMessage;
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Lists the messages in the user's mailbox.
             * @params {boolean} includeSpamTrash Include messages from SPAM and TRASH in the results.
             * @params {string} labelIds Only return messages with labels that match all of the specified label IDs.
             * @params {number} maxResults Maximum number of messages to return.
             * @params {string} pageToken Page token to retrieve a specific page of results in the list.
             * @params {string} q Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            list: (params: {
                includeSpamTrash?: boolean;
                labelIds?: string;
                maxResults?: number;
                pageToken?: string;
                q?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IListMessagesResponse, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Modifies the labels on the specified message.
             * @params {string} id The ID of the message to modify.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            modify: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IModifyMessageRequest;
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Sends the specified message to the recipients in the To, Cc, and Bcc headers.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            send: (params: {
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IMessage;
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Moves the specified message to the trash.
             * @params {string} id The ID of the message to Trash.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            trash: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Removes the specified message from the trash.
             * @params {string} id The ID of the message to remove from Trash.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            untrash: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IMessage, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            attachments: {
                /**
                 * Gets the specified message attachment.
                 * @params {string} id The ID of the attachment.
                 * @params {string} messageId The ID of the message containing the attachment.
                 * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
                 */
                get: (params: {
                    id: string;
                    messageId: string;
                    userId: string;
                    key?: string; // API_KEY
                    auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                }, callback: (err: IErrorResponse, response: IMessagePartBody, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            };
        };
        threads: {
            /**
             * Immediately and permanently deletes the specified thread. This operation cannot be undone. Prefer threads.trash instead.
             * @params {string} id ID of the Thread to delete.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            delete: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: any, incomingMessage: any /* http.IncomingMessage */) => void ) => void; // void
            /**
             * Gets the specified thread.
             * @params {string} format The format to return the messages in.
             * @params {string} id The ID of the thread to retrieve.
             * @params {string} metadataHeaders When given and format is METADATA, only include headers specified.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            get: (params: {
                format?: string;
                id: string;
                metadataHeaders?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IThread, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Lists the threads in the user's mailbox.
             * @params {boolean} includeSpamTrash Include threads from SPAM and TRASH in the results.
             * @params {string} labelIds Only return threads with labels that match all of the specified label IDs.
             * @params {number} maxResults Maximum number of threads to return.
             * @params {string} pageToken Page token to retrieve a specific page of results in the list.
             * @params {string} q Only return threads matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            list: (params: {
                includeSpamTrash?: boolean;
                labelIds?: string;
                maxResults?: number;
                pageToken?: string;
                q?: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IListThreadsResponse, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Modifies the labels applied to the thread. This applies to all messages in the thread.
             * @params {string} id The ID of the thread to modify.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            modify: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
                resource?: IModifyThreadRequest;
            }, callback: (err: IErrorResponse, response: IThread, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Moves the specified thread to the trash.
             * @params {string} id The ID of the thread to Trash.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            trash: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IThread, incomingMessage: any /* http.IncomingMessage */) => void) => void;
            /**
             * Removes the specified thread from the trash.
             * @params {string} id The ID of the thread to remove from Trash.
             * @params {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
             */
            untrash: (params: {
                id: string;
                userId: string;
                key?: string; // API_KEY
                auth?: googleapis.google.auth.OAuth2; // string(API_KEY) or googleapis.google.auth.OAuth2
            }, callback: (err: IErrorResponse, response: IThread, incomingMessage: any /* http.IncomingMessage */) => void) => void;
        };
    };
    /**
     * A draft email in the user's mailbox.
     */
    interface IDraft {
        /**
         * The immutable ID of the draft.
         */
        id: string;
        /**
         * The message content of the draft.
         */
        message: IMessage;
    }
    /**
     * A record of a change to the user's mailbox. Each history contains a list of the messages that were affected by this change.
     */
    interface IHistory {
        /**
         * The mailbox sequence ID.
         */
        id: string; // uint64
        /**
         * The messages that changed in this history record.
         */
        messages: IMessage[];
    }
    /**
     * Labels are used to categorize messages and threads within the user's mailbox.
     */
    interface ILabel {
        /**
         * The immutable ID of the label.
         */
        id: string;
        /**
         * The visibility of the label in the label list in the Gmail web interface.
         */
        labelListVisibility: string;
        /**
         * The visibility of the label in the message list in the Gmail web interface.
         */
        messageListVisibility: string;
        /**
         * The total number of messages with the label.
         */
        messagesTotal: number; // int32
        /**
         * The number of unread messages with the label.
         */
        messagesUnread: number; // int32
        /**
         * The display name of the label.
         */
        name: string;
        /**
         * The total number of threads with the label.
         */
        threadsTotal: number; // int32
        /**
         * The number of unread threads with the label.
         */
        threadsUnread: number; // int32
        /**
         * The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads.
         */
        type: string;
    }
    interface IListDraftsResponse {
        /**
         * List of drafts.
         */
        drafts: IDraft[];
        /**
         * Token to retrieve the next page of results in the list.
         */
        nextPageToken: string;
        /**
         * Estimated total number of results.
         */
        resultSizeEstimate: number; // uint32
    }
    interface IListHistoryResponse {
        /**
         * List of history records.
         */
        history: IHistory[];
        /**
         * The ID of the mailbox's current history record.
         */
        historyId: string; // uint64
        /**
         * Page token to retrieve the next page of results in the list.
         */
        nextPageToken: string;
    }
    interface IListLabelsResponse {
        /**
         * List of labels.
         */
        labels: ILabel[];
    }
    interface IListMessagesResponse {
        /**
         * List of messages.
         */
        messages: IMessage[];
        /**
         * Token to retrieve the next page of results in the list.
         */
        nextPageToken: string;
        /**
         * Estimated total number of results.
         */
        resultSizeEstimate: number; // uint32
    }
    interface IListThreadsResponse {
        /**
         * Page token to retrieve the next page of results in the list.
         */
        nextPageToken: string;
        /**
         * Estimated total number of results.
         */
        resultSizeEstimate: number; // uint32
        /**
         * List of threads.
         */
        threads: IThread[];
    }
    /**
     * An email message.
     */
    interface IMessage {
        /**
         * The ID of the last history record that modified this message.
         */
        historyId: string; // uint64
        /**
         * The immutable ID of the message.
         */
        id: string;
        /**
         * List of IDs of labels applied to this message.
         */
        labelIds: string[];
        /**
         * The parsed email structure in the message parts.
         */
        payload: IMessagePart;
        /**
         * The entire email message in an RFC 2822 formatted and URL-safe base64 encoded string. Returned in messages.get and drafts.get responses when the format=RAW parameter is supplied.
         */
        raw: string; // byte
        /**
         * Estimated size in bytes of the message.
         */
        sizeEstimate: number; // int32
        /**
         * A short part of the message text.
         */
        snippet: string;
        /**
         * The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met:
         * - The requested threadId must be specified on the Message or Draft.Message you supply with your request.
         * - The References and In-Reply-To headers must be set in compliance with the RFC 2822 standard.
         * - The Subject headers must match.
         */
        threadId: string;
    }
    /**
     * A single MIME message part.
     */
    interface IMessagePart {
        /**
         * The message part body for this part, which may be empty for container MIME message parts.
         */
        body: IMessagePartBody;
        /**
         * The filename of the attachment. Only present if this message part represents an attachment.
         */
        filename: string;
        /**
         * List of headers on this message part. For the top-level message part, representing the entire message payload, it will contain the standard RFC 2822 email headers such as To, From, and Subject.
         */
        headers: IMessagePartHeader[];
        /**
         * The MIME type of the message part.
         */
        mimeType: string;
        /**
         * The immutable ID of the message part.
         */
        partId: string;
        /**
         * The child MIME message parts of this part. This only applies to container MIME message parts, for example multipart/*. For non- container MIME message part types, such as text/plain, this field is empty. For more information, see RFC 1521.
         */
        parts: IMessagePart[];
    }
    /**
     * The body of a single MIME message part.
     */
    interface IMessagePartBody {
        /**
         * When present, contains the ID of an external attachment that can be retrieved in a separate messages.attachments.get request. When not present, the entire content of the message part body is contained in the data field.
         */
        attachmentId: string;
        /**
         * The body data of a MIME message part. May be empty for MIME container types that have no message body or when the body data is sent as a separate attachment. An attachment ID is present if the body data is contained in a separate attachment.
         */
        data: string; // byte
        /**
         * Total number of bytes in the body of the message part.
         */
        size: number; // int32
    }
    interface IMessagePartHeader {
        /**
         * The name of the header before the : separator. For example, To.
         */
        name: string;
        /**
         * The value of the header after the : separator. For example, someuser@example.com.
         */
        value: string;
    }
    interface IModifyMessageRequest {
        /**
         * A list of IDs of labels to add to this message.
         */
        addLabelIds: string[];
        /**
         * A list IDs of labels to remove from this message.
         */
        removeLabelIds: string[];
    }
    interface IModifyThreadRequest {
        /**
         * A list of IDs of labels to add to this thread.
         */
        addLabelIds: string[];
        /**
         * A list of IDs of labels to remove from this thread.
         */
        removeLabelIds: string[];
    }
    /**
     * Profile for a Gmail user.
     */
    interface IProfile {
        /**
         * The user's email address.
         */
        emailAddress: string;
        /**
         * The ID of the mailbox's current history record.
         */
        historyId: string; // uint64
        /**
         * The total number of messages in the mailbox.
         */
        messagesTotal: number; // int32
        /**
         * The total number of threads in the mailbox.
         */
        threadsTotal: number; // int32
    }
    /**
     * A collection of messages representing a conversation.
     */
    interface IThread {
        /**
         * The ID of the last history record that modified this thread.
         */
        historyId: string; // uint64
        /**
         * The unique ID of the thread.
         */
        id: string;
        /**
         * The list of messages in the thread.
         */
        messages: IMessage[];
        /**
         * A short part of the message text.
         */
        snippet: string;
    }
}
