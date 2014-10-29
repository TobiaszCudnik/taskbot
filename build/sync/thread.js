var label = require('./Label');
exports.Label = label.Label;

var Thread = (function () {
    function Thread(gmail_thread) {
        this.labels = null;
        this.gmail_thread = gmail_thread;
        this.labels = null;
        this.name = this.getFirstMessageSubject();
    }
    Thread.prototype.getName = function () {
        return this.name;
    };

    Thread.prototype.getLabels = function () {
        var _this = this;
        if (this.labels == null) {
            this.labels = [];
            this.gmail_thread.getLabels().forEach(function (label) {
                var tmp = new exports.Label(label);
                return _this.labels.push(tmp.getName());
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
    };

    Thread.prototype.hasLabel = function (label) {
        return this.getLabels().contains(exports.Label.normalizeName(label));
    };

    Thread.prototype.addLabel = function (label) {
        label = exports.Label.get(label);
        return label.addToThread(this);
    };

    Thread.prototype.removeLabel = function (label) {
        label = exports.Label.get(label);
        return label.removeFromThread(this);
    };

    Thread.prototype.disposeLabelCache_ = function () {
        Logger.log("Disposing labels cache for thread '" + this + "'");
        return this.labels = null;
    };

    Thread.prototype.addLabels = function (labels) {
        var _this = this;
        return labels.map(function (label) {
            return _this.addLabel(label);
        });
    };

    Thread.prototype.toString = function () {
        return this.getName();
    };

    Thread.get = function (thread) {
        if (thread instanceof Thread) {
            return thread;
        } else {
            return new Thread(thread);
        }
    };
    return Thread;
})();
exports.Thread = Thread;
//# sourceMappingURL=thread.js.map
