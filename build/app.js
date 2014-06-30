var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="gmail/connection"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
///<reference path="../d.ts/global.d.ts" />
var suspend = require('suspend');
var gmail = require('./gmail/connection');
var settings = require('../settings');
exports.go = suspend.resume;
exports.async = suspend.async;
require("sugar");

Object.merge(settings, {
    gmail_max_results: 300
});

var App = (function (_super) {
    __extends(App, _super);
    function App(settings) {
        _super.call(this, settings);
        this.addQuery("*", 1000);
        if (!this.add("Active")) {
            this.log("cant activate Active (states: " + (this.is()) + ")");
        }
    }
    return App;
})(gmail.Connection);
exports.App = App;

exports.client = new App(settings);
//# sourceMappingURL=app.js.map
