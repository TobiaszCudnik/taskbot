import LabelFilterSync from './src/sync/label-filter'
import { DBRecord, default as RootSync } from './src/sync/root'
import { IConfigBase } from './src/types'
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

const config: IConfigBase = {
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
      /^!T\/[\w\s-/]+$/,
      /^M\/[\w\s-/]+$/,
      /^P\/[\w\s-]+$/,
      /^R\/[\w\s-]+$/,
      /^L\/[\w\s-]+$/,
      /^INBOX$/,
      /^UNREAD$/
    ],
    domain: 'mail.google.com',
    orphans_freq_min: 5,
    // per user
    request_quota_100: 2_000_000,
    request_quota_100_user: 25_000,
    // global
    request_quota_day: 1_000_000_000
  },
  // TODO group exception settings
  exception_delay: 5,
  exception_flood_delay: 10 * 60,
  gtasks: {
    // per user
    request_quota_100_user: 500,
    // global
    request_quota_day: 50_000,
    quota_exceeded_delay: 50,
    // seconds
    sync_frequency: 10 * 60
  },
  // seconds
  sync_frequency: 1,
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
    },
    {
      prefix: '!T/',
      name: 'Sync GTasks',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    },
    {
      prefix: '!T/',
      name: 'Sync GTasks/Next',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    },
    {
      prefix: '!T/',
      name: 'Sync GTasks/Pending',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    },
    {
      prefix: '!T/',
      name: 'Sync GTasks/Some Day',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    },
    {
      prefix: '!T/',
      name: 'Sync GTasks/Actions',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    },
    {
      prefix: 'M/',
      name: 'GTasks/Quota Exceeded',
      colors: {
        bg: '#b9e4d0',
        fg: '#000000'
      }
    }
  ],
  label_filters: [
    {
      name: 'newest status removes other ones',
      // match all records with at least 2 status labels
      db_query: r => hasLabel(r, /!S\/.+/) > 1,
      modify(this: LabelFilterSync, r: DBRecord) {
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
        return {
          remove: _.without(remove, newest.label)
        }
      }
    },
    {
      name: 'task labels',
      db_query: r => Boolean(hasLabel(r, /!T\/.+/)),
      modify(this: LabelFilterSync, r: DBRecord) {
        const remove = []
        const add = new Set<string>()
        for (const [label, data] of Object.entries(r.labels)) {
          if (!data.active || !/!T\/.+/.test(label)) continue

          // remove every task label, even the unmatched ones
          remove.push(label)

          let match
          this.log_verbose(`Matching task label '${label}'`)

          // sync gtasks
          match = label.match(/\/Sync GTasks(\/.+?)$/)
          if (match) {
            const name = match[1]
              ? (match[1] as string).replace('/', '').toLowerCase()
              : null
            this.log(`Executing task label '${label}' (${name})`)
            for (const list of this.root.subs.google.subs.tasks.subs.lists) {
              const list_name = list.config.name.replace('!', '').toLowerCase()

              if (name && list_name != name) continue
              // force refresh
              if (list.state.is('QuotaExceeded')) {
                add.add('M/GTasks Quota Exceeded')
              } else {
                list.state.add('Dirty')
              }
            }
          }
        }
        return {
          add: [...add],
          remove
        }
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
      writers: ['gmail']
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
        gtasks_multi: 0.5
      }
    },
    {
      name: '!Pending',
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
        gtasks_multi: 1.5
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
        gtasks_multi: 2
      }
    }
  ]
}

export default config
