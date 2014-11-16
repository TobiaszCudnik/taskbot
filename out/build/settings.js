System.register("../../build/settings", [], function() {
  "use strict";
  var __moduleName = "../../build/settings";
  (function() {
    module.exports = {
      debug: true,
      google: {scopes: ['https://www.googleapis.com/auth/tasks']},
      client_id: "900809192866-270pemf710e7me8l9aaptsirjmkvit66.apps.googleusercontent.com",
      client_secret: "TohSI-VXNRKKNq0cYTkS72S6",
      access_token: "ya29.vwAPk3b9v3MGClYo1RnZu6brnWGpFAiqWBDuCPHohiHlA1z8BID5AJqknVA9lSyhI7eBSnbcv4w2eA",
      refresh_token: "1/pNKZqDahvRjqVK0dx42ZGJ4TIZNtBp73Uh6Gishutlp90RDknAdJa_sgfheVM0XT",
      gmail_username: 'gtd.box.sandbox@gmail.com',
      gmail_password: 'wikwikwik',
      gmail_host: 'gmail.com',
      auto_labels: [{
        symbol: '!',
        shortcut: 'na',
        label: 'Next Action',
        prefix: 'S/'
      }, {
        symbol: '!',
        shortcut: 'a',
        label: 'Action',
        prefix: 'S/'
      }, {
        symbol: '!',
        shortcut: 'p',
        label: 'Pending',
        prefix: 'S/'
      }, {
        symbol: '!',
        shortcut: 'sd',
        label: 'Some day',
        prefix: 'S/'
      }, {
        symbol: '!',
        shortcut: 'e',
        label: 'Expired',
        prefix: 'S/'
      }, {
        symbol: '!',
        shortcut: 'c',
        label: 'Current',
        prefix: 'S/'
      }, {
        symbol: '##',
        prefix: 'RP/',
        create: true
      }, {
        symbol: '#',
        prefix: 'P/',
        create: true
      }, {
        symbol: '^',
        prefix: 'R/',
        create: true
      }, {
        symbol: '*',
        prefix: 'L/'
      }],
      status_labels: ['S/Next action', 'S/Action', 'S/Pending', 'S/Some day', 'S/Expired'],
      label_queries: {
        'label:inbox': [[], ['S/Finished', 'S/Pending']],
        'label:inbox OR label:s-next-action -label:s-finished -label:s-expired -label:s-pending': [['V/now']],
        'label:v-now ( label:s-finished OR label:s-expired OR label:s-pending )': [[], ['V/now', 'Inbox']],
        'label:s-current ( label:s-finished OR label:s-next-action OR label:s-action OR label:s-pending )': [[], ['S/Action', 'S/Next action', 'S/Pending', 'S/Finished', 'S/Expired']],
        'label:s-finished ( label:s-next-action OR label:s-action OR label:s-pending )': [[], ['S/Action', 'S/Next action', 'S/Pending']],
        'label:s-expired ( label:s-next-action OR label:s-action OR label:s-pending )': [[], ['S/Action', 'S/Next action', 'S/Pending']],
        'label:s-someday': [[], ['S/Next Action', 'S/Action']],
        'label:s-next-action': [[], ['S/Action']],
        'label:s-pending': [[], ['S/Next Action']],
        'label:inbox label:s-next-action OR label:s-action OR label:s-pending OR label:s-expired': [[], ['Inbox']],
        'label:v-now -label:inbox -label:s-next-action -label:s-action -label:s-pending -label:s-expired': [[], ['V/now']]
      },
      status_map: {
        na: 'S/Next action',
        a: 'S/Action',
        p: 'S/Pending',
        sd: 'S/Some day',
        ex: 'S/Expired'
      },
      tasks: {
        labels_in_title: 3,
        queries: {
          labels_defaults: {
            email_unmatched: ['s-finished'],
            new_task: ['r-task'],
            task_completed: {
              add: ['s-finished'],
              remove: []
            }
          },
          '!Inbox': {query: 'label:inbox -label:s-action -label:s-next-action -label:s-pending'},
          '!Next': {
            query: 'label:s-next-action',
            labels_new_task: ['s-next-action'],
            task_completed: {remove: ['s-next-action']}
          },
          '!Actions': {
            query: 'label:s-action -(label:s-pending)',
            labels_new_task: ['s-action'],
            task_completed: {remove: ['s-action']}
          },
          '!Waiting': {
            query: 'label:s-pending',
            labels_new_task: ['s-pending'],
            task_completed: {remove: ['s-pending']}
          }
        }
      }
    };
  }).call(this);
  return {};
});
System.get("../../build/settings" + '');
