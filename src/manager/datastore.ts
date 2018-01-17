export class Label {}

export class List {
  entries: Entry[]
  name: string
}

export class Entry {
  labels: Label[]
}

export { DataStore }

export default class DataStore extends Map<List> {}
