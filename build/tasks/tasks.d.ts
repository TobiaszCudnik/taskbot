/// <reference path="../../node_modules/asyncmachine/lib/asyncmachine.d.ts" />
import asyncmachine = require('asyncmachine');
export declare class Auth extends asyncmachine.AsyncMachine {
    public Authorized: {
        blocks: string[];
    };
    public Authorizing: {
        blocks: string[];
    };
    public Discovered: {
        blocks: string[];
    };
    public Discovering: {
        blocks: string[];
    };
    public ClientAuthGained: {
        blocks: string[];
    };
    public ClientAuthGaining: {
        blocks: string[];
    };
    public Ready: {
        blocks: string[];
    };
}
export declare class List {
}
export declare class Task {
}
export declare class QueryMapper {
}
export declare class RecordMapper {
}
export declare class GmailMapper {
    public query: any;
    public record: any;
}
