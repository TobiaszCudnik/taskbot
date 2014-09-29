///<reference path="../d.ts/global.d.ts" />
import settings = require('../settings');
import suspend = require('suspend');
export var go = suspend.resume;
export var async = suspend.async;
require("sugar");

Object.merge(settings, {
    gmail_max_results: 300
});

export var main = suspend(() => new Sync(settings));

main();
