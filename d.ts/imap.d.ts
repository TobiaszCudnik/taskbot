declare module imap {
	export interface Options {
		username: string;
		password: string;
		xoauth?: string;
		host: string;
		port?: number;
		secure?: boolean;
		connTimeout?: number;
		debug?: (string) => void;
	}
	interface IOptions {
		username: string;
		password: string;
		host: string;
		port: number;
		secure?: boolean;
	}
	export class ImapConnection {
		constructor(options: IOptions);
		connect: any;
		logout: any;
		openBox: any;
		closeBox: any;
		addBox: any;
		delBox: any;
		renameBox: any;
		status: any;
		getBoxes: any;
		removeDeleted: any;
		append: any;
		search: any;
		fetch: any;
		copy: any;
		move: any;
		addFlags: any;
		delFlags: any;
		addKeywords: any;
		delKeywords: any;
		// [index: number]: any;
	}
//	export var ImapConnection: new(Options?) => ImapConnectionObject;
}

declare module "imap" {
	export = imap;
}
