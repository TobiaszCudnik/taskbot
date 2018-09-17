///<reference path="node_modules/firebase/index.d.ts"/>

interface Window {
  firebase_ready: Promise<void>
  firebase: firebase
  taskbot_account: any
  PROD: boolean
}

const markdown: {
  require(path: string): string
}

declare namespace NodeJS {
  export interface Process {
    browser: boolean
  }
}
