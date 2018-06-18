import { DBRecord } from './src/sync/root'
import { IConfig } from './src/types'
import * as _ from 'lodash'

// TODO move functions to /src/sync/label-filter.ts
const hasLabel = function(r: DBRecord, label: string | RegExp): number {
  return checkLabel(r, label, true)
}

const hadLabel = function(r: DBRecord, label: string | RegExp): number {
  return checkLabel(r, label, false)
}

function checkLabel(
  r: DBRecord,
  match: string | RegExp,
  active: boolean
): number {
  let matches = 0
  for (const [label, data] of Object.entries(r.labels)) {
    if (!data.active) continue
    if (match instanceof RegExp && match.test(label)) {
      matches++
    } else if (
      !(match instanceof RegExp) &&
      match.toLowerCase() == label.toLowerCase()
    ) {
      matches++
    }
  }
  return matches
}

const config: IConfig = {
  repl_port: 5002,
  google: {
    scopes: [
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
  },
  gmail: {
    // TODO implement
    max_results: 300,
    included_labels: [
      /^!S\/[\w\s-]+$/,
      /^P\/[\w\s-]+$/,
      /^R\/[\w\s-]+$/,
      /^L\/[\w\s-]+$/,
      /^INBOX$/,
      /^UNREAD$/
    ],
    domain: 'mail.google.com',
    orphans_freq_min: 5
  },
  exception_delay: 5,
  exception_flood_delay: 10 * 60,
  gtasks: {
    request_quota_100: 500,
    request_quota_day: 50000,
    quota_exceeded_delay: 50,
    sync_frequency: 10
  },
  labels: [
    {
      symbol: '!',
      shortcut: 'na',
      name: 'Next Action',
      prefix: '!S/',
      colors: {
        bg: '#fb4c2f',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'a',
      name: 'Action',
      prefix: '!S/',
      colors: {
        bg: '#ffad47',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'p',
      name: 'Pending',
      prefix: '!S/',
      colors: {
        bg: '#efa093',
        fg: '#000000'
      }
    },
    {
      symbol: '!',
      shortcut: 'sd',
      name: 'Some day',
      prefix: '!S/',
      colors: {
        bg: '#c9daf8',
        fg: '#000000'
      }
    },
    {
      symbol: '!',
      shortcut: 'e',
      name: 'Expired',
      prefix: '!S/',
      colors: {
        bg: '#cccccc',
        fg: '#ffffff'
      }
    },
    {
      symbol: '!',
      shortcut: 'f',
      name: 'Finished',
      prefix: '!S/',
      colors: {
        bg: '#e07798',
        fg: '#ffffff'
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
      name: 'newest status removes other ones',
      // only the ones who used to have one
      db_query: r => hasLabel(r, /!S\/.+/) > 1,
      remove(r: DBRecord) {
        let newest: { label: string; date: number } = null
        const remove = []
        for (const [label, data] of Object.entries(r.labels)) {
          if (!data.active || !/!S\/.+/.test(label)) continue
          remove.push(label)
          if (!newest || newest.date < data.updated) {
            newest = {
              label,
              date: data.updated
            }
          }
        }
        return _.without(remove, newest.label)
      }
    }
  ],
  lists: [
    {
      name: 'inbox-labels',
      gmail_query: 'in:inbox label:unread from:me to:me',
      db_query: r => Boolean(hasLabel(r, 'INBOX') && hasLabel(r, 'UNREAD')),
      enter: {},
      exit: {},
      writers: ['gmail'],
      sync_frequency: {
        gtasks: 5
      }
    },
    {
      name: '!Next',
      gmail_query: 'label:!s-next-action',
      db_query: r => Boolean(hasLabel(r, '!S/Next Action')),
      enter: {
        add: ['!S/Next Action'],
        remove: ['!S/Finished']
      },
      exit: {
        add: ['!S/Finished'],
        remove: ['!S/Next Action']
      },
      sync_frequency: {
        gtasks: 5
      }
    },
    {
      name: '!Waiting',
      gmail_query: 'label:!s-pending',
      db_query: r => Boolean(hasLabel(r, '!S/Pending')),
      enter: {
        add: ['!S/Pending'],
        remove: ['!S/Finished']
      },
      exit: {
        add: ['!S/Finished'],
        remove: ['!S/Pending']
      },
      sync_frequency: {
        gtasks: 20
      }
    },
    {
      name: '!Actions',
      gmail_query: 'label:!s-action',
      db_query: r => Boolean(hasLabel(r, '!S/Action')),
      enter: {
        remove: ['!S/Finished'],
        add: ['!S/Action']
      },
      exit: {
        add: ['!S/Finished'],
        remove: ['!S/Action']
      }
    },
    {
      name: '!Someday',
      gmail_query: 'label:!s-some-day',
      db_query: r => Boolean(hasLabel(r, '!S/Some day')),
      enter: {
        remove: ['!S/Finished'],
        add: ['!S/Some day']
      },
      exit: {
        add: ['!S/Finished'],
        remove: ['!S/Some day']
      },
      sync_frequency: {
        gtasks: 20
      }
    }
  ]
}

export default config
