import { IConfig } from './src/types'

function hasLabel(r, label) {
  return r.labels[label] && r.labels[label].active
}

// let config: IConfig = {
let config: IConfig = {
  debug: false,
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
      name: 'i&(f|p)=-f-p',
      db_query: r =>
        hasLabel(r, 'INBOX') &&
        (hasLabel(r, 'S/Finished') || hasLabel(r, 'S/Pending')),
      add: [],
      remove: ['S/Finished', 'S/Pending']
    },
    {
      name: '(i|na)-f-e-p-vnow=vnow',
      db_query: r =>
        (hasLabel(r, 'INBOX') || hasLabel(r, 'S/Next Action')) &&
        !(
          hasLabel(r, 'S/Finished') ||
          hasLabel(r, 'S/Expired') ||
          hasLabel(r, 'S/Pending') ||
          hasLabel(r, 'V/now')
        ),
      add: ['V/now'],
      remove: []
    },
    {
      name: '(f|e)&(a|na|p|vnow)=-a-na-p-vnow',
      db_query: r =>
        (hasLabel(r, 'S/Finished') || hasLabel(r, 'S/Expired')) &&
        (hasLabel(r, 'S/Next Action') ||
          hasLabel(r, 'S/Action') ||
          hasLabel(r, 'S/Pending')),
      add: [],
      remove: ['S/Next Action', 'S/Action', 'S/Pending', 'V/now']
    },
    {
      name: 's&(na|a)=-na-a',
      db_query: r =>
        hasLabel(r, 'S/Someday') &&
        (hasLabel(r, 'S/Next Action') || hasLabel(r, 'S/Action')),
      add: [],
      remove: ['S/Next Action', 'S/Action']
    },
    {
      name: 'na&a=-a',
      db_query: r => hasLabel(r, 'S/Action') && hasLabel(r, 'S/Next Action'),
      add: [],
      remove: ['S/Action']
    },
    {
      name: 'p&na=-na',
      db_query: r => hasLabel(r, 'S/Pending') && hasLabel(r, 'S/Next Action'),
      add: [],
      remove: ['S/Next Action']
    },
    {
      name: '(na|a|e|f)&i=-i',
      db_query: r =>
        (hasLabel(r, 'S/Action') ||
          hasLabel(r, 'S/Next Action') ||
          hasLabel(r, 'S/Expired') ||
          hasLabel(r, 'S/Finished')) &&
        hasLabel(r, 'INBOX'),
      add: [],
      remove: ['INBOX']
    },
    {
      name: 'no status records goes into inbox',
      db_query: r =>
        // TODO list all status labels
        !hasLabel(r, 'S/Action') &&
        !hasLabel(r, 'S/Next Action') &&
        !hasLabel(r, 'S/Expired') &&
        !hasLabel(r, 'S/Finished') &&
        !hasLabel(r, 'S/Some Day') &&
        !hasLabel(r, 'INBOX'),
      add: ['INBOX'],
      remove: []
    }
  ],
  status_map: {
    na: 'S/Next action'
  },
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
      gmail_query: 'in:inbox',
      db_query: r => hasLabel(r, 'INBOX'),
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
      db_query: r => hasLabel(r, 'S/Action'),
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
