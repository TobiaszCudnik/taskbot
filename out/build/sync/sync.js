System.register("../../../build/sync/sync", [], function() {
  "use strict";
  var __moduleName = "../../../build/sync/sync";
  (function() {
    var ITaskList,
        ITaskListArray,
        Label,
        Promise,
        States,
        Sync,
        Thread,
        asyncmachine,
        auth,
        coroutine,
        diff,
        google,
        label,
        promise_exception,
        promisify,
        thread,
        tracery,
        type,
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
          for (var key in parent) {
            if (__hasProp.call(parent, key))
              child[key] = parent[key];
          }
          function ctor() {
            this.constructor = child;
          }
          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
          child.__super__ = parent.prototype;
          return child;
        };
    thread = require('./thread');
    Thread = thread.Thread;
    label = require('./label');
    Label = label.Label;
    auth = require('../auth');
    asyncmachine = require('asyncmachine');
    google = require('googleapis');
    Promise = require('bluebird');
    Promise.longStackTraces();
    coroutine = Promise.coroutine;
    promisify = Promise.promisify;
    tracery = require('tracery');
    diff = require('tracery/diff');
    type = function(value, type) {
      if (type(value)) {
        throw new TypeError(diff(type, value));
      }
    };
    promise_exception = function(e) {
      if (e.errors) {
        console.log(e.errors);
      }
      return console.log((e.stack.split("\n")).join("\n"));
    };
    ITaskList = {
      id: String,
      kind: String,
      title: String,
      selfLink: String,
      updated: String
    };
    ITaskListArray = [ITaskList];
    States = (function(_super) {
      __extends(States, _super);
      function States() {
        States.__super__.constructor.apply(this, arguments);
        this.register('Ready', 'Authenticating', 'Authenticated', 'Syncing', 'Synced');
      }
      States.prototype.Ready = {
        auto: true,
        requires: ['Authenticated']
      };
      States.prototype.Authenticating = {blocks: ['Authenticated']};
      States.prototype.Authenticated = {blocks: ['Authenticating']};
      States.prototype.Syncing = {
        auto: true,
        requires: ['Ready'],
        blocks: ['Synced']
      };
      States.prototype.Synced = {blocks: ['Syncing']};
      return States;
    })(asyncmachine.AsyncMachine);
    Sync = (function() {
      Sync.prototype.states = null;
      Sync.prototype.config = null;
      Sync.prototype.auth = null;
      Sync.prototype.tasks = null;
      Sync.prototype.gmail = null;
      function Sync(config) {
        this.config = config;
        this.states = new States;
        if (config.debug) {
          this.states.debug('Sync ', 2);
        }
        this.auth = new auth.Auth(config);
        this.tasks = new google.tasks('v1', {auth: this.auth.client});
        this.gmail = new google.gmail('v1', {auth: this.auth.client});
        this.states.add('Authenticating');
        this.states.on('Syncing.enter', (function(_this) {
          return function() {
            var promise;
            console.log('Syncing.enter');
            promise = _this.Syncing_enter();
            return promise["catch"](promise_exception);
          };
        })(this));
        this.auth.pipeForward('Ready', this.states, 'Authenticated');
      }
      Sync.prototype.Syncing_enter = coroutine($traceurRuntime.initGeneratorFunction(function $__0() {
        var data,
            list,
            name,
            res,
            task,
            tasks,
            tasks_in_threads,
            threads,
            value,
            was_created,
            _i,
            _len,
            _ref,
            $__1,
            $__2,
            $__3,
            $__4,
            $__5,
            $__6,
            $__7,
            $__8,
            $__9,
            $__10,
            $__11,
            $__12,
            $__13,
            $__14,
            $__15,
            $__16,
            $__17,
            $__18,
            $__19,
            $__20,
            $__21,
            $__22,
            $__23,
            $__24,
            $__25,
            $__26,
            $__27,
            $__28,
            $__29,
            $__30,
            $__31,
            $__32,
            $__33,
            $__34,
            $__35,
            $__36,
            $__37,
            $__38,
            $__39;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__5 = this.getTaskLists;
                $__6 = $__5.call(this);
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return $__6;
              case 2:
                $__7 = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                this.task_lists = $__7;
                $ctx.state = 8;
                break;
              case 8:
                _ref = this.config.tasks.queries;
                $ctx.state = 95;
                break;
              case 95:
                $__1 = [];
                $__2 = _ref;
                for ($__3 in $__2)
                  $__1.push($__3);
                $ctx.state = 91;
                break;
              case 91:
                $__4 = 0;
                $ctx.state = 89;
                break;
              case 89:
                $ctx.state = ($__4 < $__1.length) ? 79 : 87;
                break;
              case 73:
                $__4++;
                $ctx.state = 89;
                break;
              case 79:
                name = $__1[$__4];
                $ctx.state = 80;
                break;
              case 80:
                $ctx.state = (!(name in $__2)) ? 73 : 77;
                break;
              case 77:
                data = _ref[name];
                $ctx.state = 82;
                break;
              case 82:
                $ctx.state = (name === 'label_defaults') ? 73 : 10;
                break;
              case 10:
                this.query = data;
                this.query_name = name;
                $ctx.state = 84;
                break;
              case 84:
                $__8 = this.getListForQuery;
                $__9 = $__8.call(this, name, data);
                $ctx.state = 17;
                break;
              case 17:
                $ctx.state = 13;
                return $__9;
              case 13:
                $__10 = $ctx.sent;
                $ctx.state = 15;
                break;
              case 15:
                list = $__10;
                $ctx.state = 19;
                break;
              case 19:
                $__11 = Promise.all;
                $__12 = this.getThreads;
                $__13 = data.query;
                $__14 = $__12.call(this, $__13);
                $ctx.state = 33;
                break;
              case 33:
                $ctx.state = 21;
                return $__14;
              case 21:
                $__15 = $ctx.sent;
                $ctx.state = 23;
                break;
              case 23:
                $__16 = this.getTasks;
                $__17 = list.id;
                $__18 = $__16.call(this, $__17);
                $ctx.state = 35;
                break;
              case 35:
                $ctx.state = 25;
                return $__18;
              case 25:
                $__19 = $ctx.sent;
                $ctx.state = 27;
                break;
              case 27:
                $__20 = $__11.call(Promise, $__15, $__19);
                $ctx.state = 37;
                break;
              case 37:
                $ctx.state = 29;
                return $__20;
              case 29:
                $__21 = $ctx.sent;
                $ctx.state = 31;
                break;
              case 31:
                value = $__21;
                $ctx.state = 39;
                break;
              case 39:
                threads = value[0];
                tasks = value[1];
                tasks_in_threads = [];
                $ctx.state = 86;
                break;
              case 86:
                _i = 0, _len = threads.length;
                $ctx.state = 63;
                break;
              case 63:
                $ctx.state = (_i < _len) ? 57 : 61;
                break;
              case 51:
                _i++;
                $ctx.state = 63;
                break;
              case 57:
                thread = threads[_i];
                $ctx.state = 58;
                break;
              case 58:
                $__22 = this.getTaskForThread;
                $__23 = $__22.call(this, thread, tasks_in_threads);
                $ctx.state = 45;
                break;
              case 45:
                $ctx.state = 41;
                return $__23;
              case 41:
                $__24 = $ctx.sent;
                $ctx.state = 43;
                break;
              case 43:
                res = $__24;
                $ctx.state = 47;
                break;
              case 47:
                task = res[0];
                was_created = res[1];
                $ctx.state = 60;
                break;
              case 60:
                $ctx.state = (!was_created) ? 54 : 51;
                break;
              case 54:
                tasks_in_threads.push(ret);
                $ctx.state = 55;
                break;
              case 55:
                $__25 = this.syncTaskName;
                $__26 = $__25.call(this, task, thread);
                $ctx.state = 53;
                break;
              case 53:
                $ctx.state = 49;
                return $__26;
              case 49:
                $__27 = $ctx.sent;
                $ctx.state = 51;
                break;
              case 61:
                $__28 = Promise.all;
                $__29 = this.createThreadFromTasks;
                $__30 = this.markTasksAsCompleted;
                $__31 = $__30.call(this, tasks, list_id, tasks_in_threads);
                $__32 = $__29.call(this, tasks, list_id, threads, $__31);
                $__33 = $__28.call(Promise, $__32);
                $ctx.state = 69;
                break;
              case 69:
                $ctx.state = 65;
                return $__33;
              case 65:
                $__34 = $ctx.sent;
                $ctx.state = 67;
                break;
              case 67:
                $__35 = this.tasks;
                $__36 = $__35.Tasks;
                $__37 = $__36.clear;
                $__38 = $__37.call($__36, list_id);
                $ctx.state = 75;
                break;
              case 75:
                $ctx.state = 71;
                return $__38;
              case 71:
                $__39 = $ctx.sent;
                $ctx.state = 73;
                break;
              case 87:
                $ctx.returnValue = this.states.add('Synced');
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__0, this);
      }));
      Sync.prototype.createTaskList = coroutine(function(name) {
        var list,
            list_id;
        list = {name: name};
        list_id = this.tasks.tasklists.insert(list).getId();
        return list_id;
      });
      Sync.prototype.getTaskLists = coroutine($traceurRuntime.initGeneratorFunction(function $__40() {
        var fn,
            lists,
            res,
            $__41,
            $__42,
            $__43,
            $__44,
            $__45;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                fn = promisify(this.tasks.tasklists.list);
                $ctx.state = 12;
                break;
              case 12:
                $__41 = this.auth;
                $__42 = $__41.client;
                $__43 = {auth: $__42};
                $__44 = fn($__43);
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return $__44;
              case 2:
                $__45 = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                res = $__45;
                $ctx.state = 8;
                break;
              case 8:
                lists = res[1].body.items;
                type(lists, ITaskListArray);
                $ctx.state = 14;
                break;
              case 14:
                $ctx.returnValue = lists;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__40, this);
      }));
      Sync.prototype.getListForQuery = function(query, data) {
        var list,
            list_id,
            r,
            _i,
            _len,
            _ref;
        list = null;
        list_id = null;
        this.def_title = data.labels_in_title || this.config.labels_in_title;
        console.log("Parsing tasks for query '" + query + "'");
        _ref = this.task_lists;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          if (name === r.name) {
            list = r;
            list_id = list.getId();
            break;
          }
        }
        if (!list_id) {
          list = this.createTaskList(name);
          list_id = list.getId();
          console.log("Creating tasklist '" + name + "'");
        }
        return list;
      };
      return Sync;
    })();
    module.exports = {
      Sync: Sync,
      States: States
    };
  }).call(this);
  return {};
});
System.get("../../../build/sync/sync" + '');
