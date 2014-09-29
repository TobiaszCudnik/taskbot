///<reference path="../../d.ts/global.d.ts" />
///<reference path="../gmail-imap/connection"/>
///<reference path="../auth"/>
///<reference path="../../d.ts/tasks-v1-nodejs.d.ts"/>
///<reference path="../../d.ts/bluebird.d.ts"/>

class States extends asyncmachine.AsyncMachine {

}

class Sync {
	states: States;
	settings: IGtdBotSettings;
	imap: Connection;
	auth: Auth;
	tasks: googleapis.tasks;

	getListForQuery(query: string, data: Object): googleapis.tasks.ITaskList;
}
