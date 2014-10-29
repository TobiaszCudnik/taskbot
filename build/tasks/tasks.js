var google = require("googleapis");
exports.OAuth2Client = google.auth.OAuth2;

var List = (function () {
    function List() {
    }
    return List;
})();
exports.List = List;

var Task = (function () {
    function Task() {
    }
    Task.prototype.toGmailMsg = function () {
    };
    return Task;
})();
exports.Task = Task;
//# sourceMappingURL=tasks.js.map
