module "flow" {
    export function define(...funcs: Function[]): void;
	export function exec(...funcs: Function[]): void;
};

module "imap" {
	export var ImapConnection: any;
};

module "jsprops" {
	interface PropertyData {
		get?(): any;
		set?(): any;
		init?(): any;
	}
	export function property(name: string, data?: PropertyData, def?: any): (...args: any[]) => any;
};

module "sugar" {}

interface Object {
	merge(target: Object, source: Object, deep?: bool, resolve?: bool): any;
}

module "when" {
	export function defer(): any;
	export var Promise: any;
	export var Deferred: any;
};