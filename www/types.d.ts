///<reference path="node_modules/firebase/index.d.ts"/>

interface Window {
  firebase_ready: Promise<void>
  firebase: firebase
  taskbot_account: any
  TB_ENV: 'production' | 'staging' | 'dev'
  gtag: Function
}

const markdown: {
  require(path: string): string
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare namespace NodeJS {
  export interface Process {
    browser: boolean
  }
}
