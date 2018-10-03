declare namespace NodeJS {
  export interface Global {
    am_logger: any
    am_network: any
  }
}

declare module '*.json' {
  const a: any
  export default a
}
