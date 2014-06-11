///<reference path="global.d.ts"/>

declare module "imap" {
	interface IExport {
		new(options:imap.IOptions): imap.Imap;
		parseHeader(headers: Object): Object;
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
	export interface Imap extends EventEmitter {
		new(options: IOptions);
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
		end(cb: Function): any;
		addFlags: any;
		delFlags: any;
		addKeywords: any;
		delKeywords: any;
		// [index: number]: any;
	}
	
	// TODO remove the duplicate (somehow) 
	export function parseHeader(headers: Object): Object;
}