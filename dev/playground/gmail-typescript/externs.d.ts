module "flow" {
    export function define(...funcs: Function[]): void;
	export function exec(...funcs: Function[]): void;
};

module "imap" {
	interface Options {
		username: string;
		password: string;
		xoauth?: string;
		host: string;
		port?: number;
		secure?: bool;
		connTimeout?: number;
		debug?: (string) => void;
	}
	export interface ImapConnectionObject {
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
	};
	export var ImapConnection: new(Options?) => ImapConnectionObject
};

module "jsprops" {
	interface PropertyData {
		get?(): any;
		set?(): any;
		init?(): any;
	}
	export function property(name: string, data?: PropertyData, def?: any): (...args: any[]) => any;
};

module "sugar" {};

interface Object {
	merge(target: Object, source: Object, deep?: bool, resolve?: bool): any;
};

module "when" {
	export function defer(): Deferred;
	export interface Promise {
		then: (...args: Function[]) => Promise;
		always: (callback: Function, progressback?: Function) => Promise;
		otherwise: (errback: Function) => Promise;
	};
	export interface Resolver {
		resolve: (...args: any[]) => any;
		reject: (err: any) => any;
		progress: (...args: any[]) => any;
	}
	export interface Deferred extends Promise, Resolver {
		promise: Promise;
		resolver: Resolver;
	};
	export function all(promises: Promise[]): Promise;
};

// TODO
// function
// all, any, some, chain