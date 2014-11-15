///<reference path="../../typings/global.d.ts" />
///<reference path="../auth"/>
///<reference path="../../typings/bluebird.d.ts"/>

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
