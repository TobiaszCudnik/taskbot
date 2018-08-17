import * as moment from 'moment-timezone'
import { IAccount } from './src/types'

export const test_user: IAccount = {
  enabled: true,
  email: 'email@gmail.com',
  registered: moment()
    .utc()
    .toISOString(),
  client_data: {
    enabled: true
  },
  config: {
    user: {
      id: '1'
    },
    google: {
      username: 'email@gmail.com',
      access_token: '',
      refresh_token: ''
    }
  }
}
