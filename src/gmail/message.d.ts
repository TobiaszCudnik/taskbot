///<reference path="../../d.ts/global.d.ts"/>

class Message {
	id: number;
	subject: string;
	body: string;
	labels: string[];
	fetch_id: number;
	
	constructor(id: number, subject: string, labels: string[], body?: string);
}