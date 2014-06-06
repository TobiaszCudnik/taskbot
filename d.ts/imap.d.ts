declare module "imap" {
	interface IExport {
		new(options:imap.IOptions): imap.Imap;
	}
	var exported: IExport;
	export = exported;
//	export var ImapConnection: new(Options?) => ImapConnectionObject;
}

declare module imap {
	export interface IOptions {
		user: string;
		password: string;
		xoauth?: string;
		host: string;
		port?: number;
		tls?: boolean;
		connTimeout?: number;
		debug?: (string) => void;
	}
	// TODO extend event emitter
	export class Imap {
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
}