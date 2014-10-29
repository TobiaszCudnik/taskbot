///<reference path="../d.ts/global.d.ts" />
import settings = require('../settings');
import suspend = require('suspend');
import sync = require('sync/sync');
export var Sync = sync.Sync;
export var go = suspend.resume;
export var async = suspend.async;

settings.extend({
    gmail_max_results: 300
});

export var main = suspend(() => new Sync(settings));

main();
