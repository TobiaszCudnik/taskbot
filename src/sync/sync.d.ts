///<reference path="../../d.ts/global.d.ts" />
///<reference path="../auth"/>
///<reference path="../../d.ts/bluebird.d.ts"/>

class States extends asyncmachine.AsyncMachine {

}

class Sync {
	states: States;
	settings: IGtdBotSettings;
	imap: Connection;
	auth: Auth;
	tasks: googleapis.tasks;
	gmail: googleapis.gmail;

	getListForQuery(query: string, data: Object): googleapis.tasks.ITaskList;
}