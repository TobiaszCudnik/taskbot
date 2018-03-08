import { IConfig } from './src/types'

function hasLabel(r, label) {
  // TODO case insensitive compare
  return r.labels[label] && r.labels[label].active
}

function hadLabel(r, label) {
  // TODO case insensitive compare
  return r.labels[label] && !r.labels[label].active
}

// let config: IConfig = {
let config: IConfig = {
  repl_port: 5002,
  google: {
    scopes: [
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
  },
  gmail_host: 'gmail.com',
  // TODO implement
  gmail_max_results: 300,
  exception_delay: 5,
  exception_flood_delay: 10 * 60,
  gtasks: {
    request_quota_100: 500,
    request_quota_day: 50000,
    quota_exceeded_delay: 50,
    sync_frequency: 5
  },
  labels: [
    {
      symbol: '!',
      shortcut: 'na',
      name: 'Next Action',
      prefix: 'S/',
      colors: {
        bg: '#fb4c2f',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'a',
      name: 'Action',
      prefix: 'S/',
      colors: {
        bg: '#ffad47',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'p',
      name: 'Pending',
      prefix: 'S/',
      colors: {
        bg: '#efa093',
        fg: '#000000'
      }
    },
    {
      symbol: '!',
      shortcut: 'sd',
      name: 'Some day',
      prefix: 'S/',
      colors: {
        bg: '#c9daf8',
        fg: '#000000'
      }
    },
    {
      symbol: '!',
      shortcut: 'e',
      name: 'Expired',
      prefix: 'S/',
      colors: {
        bg: '#cccccc',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'f',
      name: 'Finished',
      prefix: 'S/',
      colors: {
        bg: '#e07798',
        fg: '#ffffff'
      }
    },
    {
      name: 'now',
      prefix: 'V/',
      colors: {
        bg: '#fcdee8',
        fg: '#000000'
      }
    },
    {
      prefix: 'S/',
      name: 'Ignored'
    },
    {
      symbol: '#',
      prefix: 'P/',
      colors: {
        bg: '#a4c2f4',
        fg: '#000000'
      }
    },
    {
      symbol: '^',
      prefix: 'R/',
      colors: {
        bg: '#ffd6a2',
        fg: '#000000'
      }
    },
    {
      symbol: '*',
      prefix: 'L/',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    }
  ],
  sync_frequency: 1,
  label_filters: [
    {
      name: 'finish or expired removes all other statuses',
      db_query: r =>
        (hasLabel(r, 'S/Finished') || hasLabel(r, 'S/Expired')) &&
        (hasLabel(r, 'S/Next Action') ||
          hasLabel(r, 'S/Action') ||
          hasLabel(r, 'S/Some day') ||
          hasLabel(r, 'S/Pending')),
      add: [],
      remove: ['S/Next Action', 'S/Action', 'S/Pending']
    },
    {
      name: 'someday removes action and next action',
      db_query: r =>
        hasLabel(r, 'S/Someday') &&
        (hasLabel(r, 'S/Next Action') || hasLabel(r, 'S/Action')),
      add: [],
      remove: ['S/Next Action', 'S/Action']
    },
    {
      name: 'next action removes action',
      db_query: r => hasLabel(r, 'S/Action') && hasLabel(r, 'S/Next Action'),
      add: [],
      remove: ['S/Action']
    },
    {
      name: 'pending removes next action',
      db_query: r => hasLabel(r, 'S/Pending') && hasLabel(r, 'S/Next Action'),
      add: [],
      remove: ['S/Next Action']
    },
    {
      name: 'records with a status leave the inbox',
      db_query: r =>
        // TODO list all status labels
        (hasLabel(r, 'S/Action') ||
          hasLabel(r, 'S/Next Action') ||
          hasLabel(r, 'S/Expired') ||
          hasLabel(r, 'S/Pending') ||
          hasLabel(r, 'S/Some day') ||
          hasLabel(r, 'S/Finished')) &&
        hasLabel(r, 'INBOX'),
      add: [],
      remove: ['INBOX']
    },
    {
      name: 'records without a status go into the inbox',
      // only the ones who used to have one
      db_query: r =>
        // TODO list all status labels
        !hasLabel(r, 'S/Action') &&
        !hasLabel(r, 'S/Next Action') &&
        !hasLabel(r, 'S/Expired') &&
        !hasLabel(r, 'S/Pending') &&
        !hasLabel(r, 'S/Finished') &&
        !hasLabel(r, 'S/Some day') &&
        (hadLabel(r, 'S/Action') ||
          hadLabel(r, 'S/Next Action') ||
          hadLabel(r, 'S/Expired') ||
          hadLabel(r, 'S/Pending') ||
          hadLabel(r, 'S/Finished') ||
          hadLabel(r, 'S/Some day')) &&
        !hasLabel(r, 'INBOX') &&
        !hasLabel(r, 'S/Ignored'),
      add: ['INBOX'],
      remove: []
    },
    {
      name: 'inbox or next action adds v-now',
      db_query: r =>
        (hasLabel(r, 'INBOX') || hasLabel(r, 'S/Next Action')) &&
        !hasLabel(r, 'V/now'),
      add: ['V/now'],
      remove: []
    },
    {
      name: 'no inbox and no next action removes v-now',
      db_query: r =>
        !(hasLabel(r, 'INBOX') || hasLabel(r, 'S/Next Action')) &&
        hasLabel(r, 'V/now'),
      add: [],
      remove: ['V/now']
    }
  ],
  lists: [
    {
      name: '!Next',
      gmail_query: 'label:s-next-action',
      db_query: r => hasLabel(r, 'S/Next Action'),
      enter: {
        add: ['S/Next Action'],
        remove: ['S/Finished']
      },
      exit: {
        add: ['S/Finished'],
        remove: ['S/Next Action']
      }
    },
    {
      name: '!Waiting',
      gmail_query: 'label:s-pending',
      db_query: r => hasLabel(r, 'S/Pending'),
      enter: {
        add: ['S/Pending'],
        remove: ['S/Finished']
      },
      exit: {
        add: ['S/Finished'],
        remove: ['S/Pending']
      }
    },
    {
      name: '!Inbox',
      gmail_query: 'in:inbox -s-ignored',
      db_query: r => hasLabel(r, 'INBOX') && !hasLabel(r, 'S/Ignored'),
      enter: {
        add: ['INBOX'],
        remove: ['S/Finished']
      },
      exit: {
        add: ['S/Finished'],
        remove: ['INBOX']
      }
    },
    {
      name: '!Actions',
      gmail_query: 'label:s-action',
      db_query: r => hasLabel(r, 'S/Action'),
      enter: {
        remove: ['S/Finished'],
        add: ['S/Action']
      },
      exit: {
        add: ['S/Finished'],
        remove: ['S/Action']
      }
    },
    {
      name: '!Someday',
      gmail_query: 'label:s-some-day',
      db_query: r => hasLabel(r, 'S/Some day'),
      enter: {
        remove: ['S/Finished'],
        add: ['S/Some day']
      },
      exit: {
        add: ['S/Finished'],
        remove: ['S/Some day']
      }
    }
  ]
}

export default config
