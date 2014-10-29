///<reference path="../d.ts/global.d.ts" />
var settings = require('../settings');
var suspend = require('suspend');
var sync = require('sync/sync');
exports.Sync = sync.Sync;
exports.go = suspend.resume;
exports.async = suspend.async;
settings.extend({
    gmail_max_results: 300
});
exports.main = suspend(function () { return new exports.Sync(settings); });
exports.main();
//# sourceMappingURL=app.js.map