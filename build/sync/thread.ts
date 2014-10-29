import label = require('./Label');
export var Label = label.Label;

export class Thread {
    labels = null;

    constructor(gmail_thread) {
        this.gmail_thread = gmail_thread;
        this.labels = null;
        this.name = this.getFirstMessageSubject();
    }

    getName() {
        return this.name;
    }

    getLabels() {
        if (this.labels == null) {
            this.labels = [];
            this.gmail_thread.getLabels().forEach((label) => {
                var tmp = new Label(label);
                return this.labels.push(tmp.getName());
            });
            if (this.gmail_thread.isInInbox()) {
                this.labels.push("inbox");
            }

            if (this.gmail_thread.isInChats()) {
                this.labels.push("chat");
            }

            Logger.log("Found " + this.labels.length + " labels for thread '" + this + "'.");
        }

        return this.labels;
    }

    hasLabel(label) {
        return this.getLabels().contains(Label.normalizeName(label));
    }

    addLabel(label) {
        label = Label.get(label);
        return label.addToThread(this);
    }

    removeLabel(label) {
        label = Label.get(label);
        return label.removeFromThread(this);
    }

    disposeLabelCache_() {
        Logger.log("Disposing labels cache for thread '" + this + "'");
        return this.labels = null;
    }

    addLabels(labels) {
        return labels.map((label) => this.addLabel(label));
    }

    toString() {
        return this.getName();
    }

    static get(thread) {
        if (thread instanceof Thread) {
            return thread;
        } else {
            return new Thread(thread);
        }
    }
}
