export class Label {}

export class List {
  entries: Entry[]
}

export class Entry {
  labels: Label[]
}

export class DataStore {
  lists: List[]
}
