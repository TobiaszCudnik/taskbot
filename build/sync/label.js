var thread = require('./Thread');
exports.Thread = thread.Thread;
var Label = (function () {
    function Label(gmail_label) {
        this.gmail_label = gmail_label;
        this.name = this.gmail_label.getName();
    }
    Label.prototype.isStatusLabel = function () {
        return /^s-/.test(this.getName);
    };
    Label.prototype.getName = function () {
        return Label.normalizeName(this.name);
    };
    Label.prototype.belongsToThread = function (thread) {
        if (thread.gmail_thread == null) {
            thread = new exports.Thread(thread);
        }
        return !!(thread.hasLabel(this.getName()));
    };
    Label.prototype.toString = function () {
        return this.getName();
    };
    Label.prototype.addToThread = function (thread) {
        thread = exports.Thread.get(thread);
        this.gmail_label.addToThread(thread.gmail_thread);
        return thread.disposeLabelCache_();
    };
    Label.prototype.removeFromThread = function (thread) {
        thread = exports.Thread.get(thread);
        this.gmail_label.removeFromThread(thread.gmail_thread);
        return thread.disposeLabelCache_();
    };
    Label.exists = function (name) {
        return !!(this.labels[name] || GmailApp.getUserLabelByName(name));
    };
    /*
        Ultimately get label:
        - Normalize name.
        - Return cached if exists.
        - Create if not exists.
    */
    Label.get = function (name) {
        var label_name = this.normalizeName(this.getLabelName_(name));
        if (!this.labels[label_name]) {
            this.labels[label_name] = this.getOrCreate(name);
        }
        return new Label(this.labels[label_name]);
    };
    Label.getOrCreate = function (name) {
        return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
    };
    Label.getLabelName_ = function (name) {
        if ((name != null ? name.getName : void 0) != null) {
            return name.getName();
        }
        else {
            return name;
        }
    };
    Label.normalizeName = function (name) {
        return name.toString().replace(/(^\s+|\s+$)/g, "").replace(/[^\w]/g, "-").toLowerCase();
    };
    Label.preloadAllLabels = function () {
        /*
                TODO use getUserLabels to prevent api hits.
        */
    };
    Label.disposeCache = function () {
        return this.labels = {};
    };
    Label.labels = {};
    return Label;
})();
exports.Label = Label;
//# sourceMappingURL=label.js.map