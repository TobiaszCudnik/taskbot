///<reference path="../d.ts/global.d.ts" />
var settings = require('../settings');
var suspend = require('suspend');
exports.go = suspend.resume;
exports.async = suspend.async;
require("sugar");

Object.merge(settings, {
    gmail_max_results: 300
});

exports.main = suspend(function () {
    return new Sync(settings);
});

exports.main();
//# sourceMappingURL=app.js.map
