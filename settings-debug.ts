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
  gmail_max_results: 300,
  text_labels: [
    {
      symbol: '!',
      shortcut: 'na',
      label: 'Next Action',
      prefix: 'S/'
    }
  ],
  status_labels: ['S/Next action'],
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
      name: '(f|e)&a&na&p=-a-na-p',
      db_query: r =>
        (hasLabel(r, 'S/Finished') || hasLabel(r, 'S/Expired')) &&
        (hasLabel(r, 'S/Next Action') ||
          hasLabel(r, 'S/Action') ||
          hasLabel(r, 'S/Pending')),
      add: [],
      remove: ['S/Next Action', 'S/Action', 'S/Pending']
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
        remove: [
          'S/Next Action',
          'S/Finished',
          'S/Expired',
          'S/Pending',
          'S/Action'
        ]
      },
      exit: {
        remove: ['INBOX']
      }
    }
  ]
}

export default config
