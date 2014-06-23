///<reference path="global.d.ts"/>

declare module "imap" {
	interface IExport {
		new(options:imap.ImapOptions): imap.Imap;
        ImapMessage: imap.ImapMessage;
        Box: imap.Box;
        ImapFetch: imap.ImapFetch;
		parseHeader(headers: Object): Object;
	}
	var exported: IExport;
	export = exported;
//	export var ImapConnection: new(Options?) => ImapConnectionObject;
}

declare module imap {

    export class ImapEventEmitter {
        addListener(event: string, listener: Function);
        on(event: string, listener: Function);
        once(event: string, listener: Function): void;
        removeListener(event: string, listener: Function): void;
        removeAllListeners(event: string): void;
        setMaxListeners(n: number): void;
        listeners(event: string): { Function; }[];
        emit(event: string, arg1?: any, arg2?: any): void;
    }
    
	export interface ImapOptions {
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
		new(options: ImapOptions);
		connect: any;
		logout: any;
		openBox(mailboxName: string, openReadOnly: boolean, callback:
            (err: Error, box: Box) => void);
		closeBox: any;
		addBox: any;
		delBox: any;
		renameBox: any;
		status: any;
		getBoxes: any;
		removeDeleted: any;
		append: any;
		search(criteria: any, callback:
            (err: Error, results: number[]) => void);
        // TODO just a stub
		fetch(source: number[], options: any): ImapFetch;
		copy: any;
		move: any;
		end(cb: Function): any;
		addFlags: any;
		delFlags: any;
		addKeywords: any;
		delKeywords: any;
		// [index: number]: any;
	}
    
//    export interface ImapSearchCriteria {
//        
//    }
    
//    export interface ImapFetchOptions {
//        
//    }
    
	export class ImapMessage extends ImapEventEmitter {
        on(event: string, listener: Function);
        once(event: string, listener: Function): void;
        // Emitted for each requested body.
        on(event: 'body', listener: 
            (stream?: ReadableStream, info?: ImapMessageInfo) => void);
        once(event: 'body', listener: 
            (stream?: ReadableStream, info?: ImapMessageInfo) => void);
        // Emitted when all message attributes have been collected
        on(event: 'attributes', listener: 
            (attrs?: ImapMessageAttributes) => void);
        once(event: 'attributes', listener: 
            (attrs?: ImapMessageAttributes) => void);
        // Emitted when all attributes and bodies have been parsed.
        on(event: 'end', listener: () => void);
        once(event: 'end', listener: () => void);
    }
    
    // TODO Are these all?
    export interface ImapMessageInfo {
        which: string;
        size: number;
    }
    
    export class ImapFetch extends ImapEventEmitter {
        on(event: string, listener: Function);
        once(event: string, listener: Function): void;
        // Emitted for each message resulting from a fetch request. seqno is the
        // message's sequence number.
        on(event: 'message', listener: (msg?: ImapMessage, seqno?: number)
            => void);
        once(event: 'message', listener: (msg?: ImapMessage, seqno?: number)
            => void);
        // Emitted when an error occurred.
        on(event: 'error', listener: (err: Error) => void); 
        once(event: 'error', listener: (err: Error) => void); 
        // Emitted when all messages have been parsed.
        on(event: 'end', listener: () => void);
        once(event: 'end', listener: () => void);
    }
    
	export class Box extends ImapEventEmitter {
        // The name of this mailbox.
        name: string;
        // True if this mailbox was opened in read-only mode. (Only available with openBox() calls)
        readOnly: boolean;
        // True if new keywords can be added to messages in this mailbox.
        newKeywords: boolean;
        // A 32-bit number that can be used to determine if UIDs in this mailbox have changed since the last time this mailbox was opened.
        uidvalidity: number;
        // The uid that will be assigned to the next message that arrives at this mailbox.
        uidnext: number;
        // A list of system-defined flags applicable for this mailbox. Flags in
        // this list but not in permFlags may be stored for the current session 
        // only. Additional server implementation-specific flags may also be 
        // available.
        flags: string[];
        // A list of flags that can be permanently added/removed to/from messages in this mailbox.
        permFlags: string[];
        // Whether or not this mailbox has persistent UIDs. This should almost always be true for modern mailboxes and should only be false for legacy mail stores where supporting persistent UIDs was not technically feasible.
        persistentUIDs: boolean;
        // Contains various message counts for this mailbox:
        // TODO interface
        messages: any;
//            // Total number of messages in this mailbox.
//            total - integer -
//            // Number of messages in this mailbox having the Recent flag (this IMAP session is the first to see these messages).
//            new - integer - 
//            // (Only available with status() calls) Number of messages in this mailbox not having the Seen flag (marked as not having been read).
//            unseen - integer - 
    }
    
//    export interface MessageSource {
//        string
//        [MessageSource]
//    }
    
    export interface ImapMessageAttributes {
        // A 32-bit ID that uniquely identifies this message within its mailbox.
        uid: number;
        // A list of flags currently set on this message (see permFlags).
        flags: string[];
        // The internal server date for the message.
        date: Date;
        // The message's body structure (only set if requested with fetch()).
        struct?: ImapMessageStructure[];
        // The RFC822 message size (only set if requested with fetch()).
        size?: number;
    }
    
    // TODO "A message structure with multiple parts"
    export interface ImapMessageStructure {
        type: string
        params: ImapMessageStructureParams;
        disposition: ImapMessageStructureDisposition;
        // TODO
        language: any;
        // TODO
        location: any;
                
        partID?: string;
        subtype?: string;
        id?: any;
        // TODO
        description?: any;
        encoding?: string;
        size?: number;
        lines?: number;
        md5?: string;
    }
    
    export interface ImapMessageStructureParams {
        charset?: string;
        name?: string;
        filename?: string;
        boundary?: string;
    }
    
    export interface ImapMessageStructureDisposition {
        type: string;
        params: ImapMessageStructureParams;
    }
	
	// TODO remove the duplicate (somehow) 
	export function parseHeader(headers: Object): Object;
}