"use strict";
const settings_1 = require('../settings');
const sync_1 = require('sync/sync');
Object.assign(settings_1.default, { gmail_max_results: 300 });
// TODO async/await ???
new sync_1.Sync(settings_1.default);
