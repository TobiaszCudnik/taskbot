import thread = require('./Thread');
export var Thread = thread.Thread;

export class Label {
    constructor(gmail_label) {
        this.gmail_label = gmail_label;
        this.name = this.gmail_label.getName();
    }

    isStatusLabel() {
        return /^s-/.test(this.getName);
    }

    getName() {
        return Label.normalizeName(this.name);
    }

    belongsToThread(thread) {
        if (thread.gmail_thread == null) {
            thread = new Thread(thread);
        }

        return !!(thread.hasLabel(this.getName()));
    }

    toString() {
        return this.getName();
    }

    addToThread(thread) {
        thread = Thread.get(thread);
        this.gmail_label.addToThread(thread.gmail_thread);
        return thread.disposeLabelCache_();
    }

    removeFromThread(thread) {
        thread = Thread.get(thread);
        this.gmail_label.removeFromThread(thread.gmail_thread);
        return thread.disposeLabelCache_();
    }

    static exists(name) {
        return !!(this.labels[name] || GmailApp.getUserLabelByName(name));
    }

    /*
    	Ultimately get label:
    	- Normalize name.
    	- Return cached if exists.
    	- Create if not exists.
    */

    static get(name) {
        var label_name = this.normalizeName(this.getLabelName_(name));

        if (!this.labels[label_name]) {
            this.labels[label_name] = this.getOrCreate(name);
        }

        return new Label(this.labels[label_name]);
    }

    static getOrCreate(name) {
        return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
    }

    static getLabelName_(name) {
        if ((name != null ? name.getName : void 0) != null) {
            return name.getName();
        } else {
            return name;
        }
    }

    static normalizeName(name) {
        return name.toString().replace(/(^\s+|\s+$)/g, "").replace(/[^\w]/g, "-").toLowerCase();
    }

    static preloadAllLabels() {
        /*
        		TODO use getUserLabels to prevent api hits.
        */
    }

    static disposeCache() {
        return this.labels = {};
    }

    static labels = {};
}
