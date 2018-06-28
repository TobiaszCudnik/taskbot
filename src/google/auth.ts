import AsyncMachine from 'asyncmachine'
import * as google from 'googleapis'
// Machine types
import {
  IBind,
  IEmit,
  IState,
  TStates
} from '../../typings/machines/google/auth'
import Logger from '../app/logger'
import { IConfig, IConfigGoogle } from '../types'
import { machineLogToDebug } from '../utils'

// TODO add logging
export default class Auth extends AsyncMachine<TStates, IBind, IEmit> {
  CredentialsSet: IState = {}

  RefreshingToken: IState = {
    auto: true,
    require: ['CredentialsSet'],
    drop: ['TokenRefreshed']
  }

  TokenRefreshed: IState = {
    require: ['CredentialsSet'],
    drop: ['RefreshingToken']
  }

  Ready: IState = {
    auto: true,
    require: ['TokenRefreshed']
  }

  Error: IState = {
    drop: ['Ready']
  }

  client: any
  config: IConfigGoogle

  constructor(config: IConfigGoogle, user_id: number, logger: Logger) {
    super(null, false)
    // google.options({ params: { quotaUser: 'user123@example.com' } });
    this.config = config
    this.register(
      'Ready',
      'CredentialsSet',
      'RefreshingToken',
      'TokenRefreshed'
    )
    this.id('Auth')
    // TODO avoid globals
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(logger, this, user_id)
      if (global.am_network) {
        global.am_network.addMachine(this)
      }
    }
    // TODO missing type
    this.client = new (<any>google).auth.OAuth2(
      config.client_id,
      config.client_secret,
      config.redirect_url
    )
    if (config.access_token && config.refresh_token) {
      this.add(
        'CredentialsSet',
        config.access_token,
        config.refresh_token
      )
    } else {
      throw new Error('not-implemented')
    }
  }

  CredentialsSet_state(access_token: string, refresh_token: string) {
    this.client.credentials = {
      access_token: access_token,
      refresh_token: refresh_token
    }
  }

  RefreshingToken_state() {
    return this.client.refreshAccessToken(this.addByCallback('TokenRefreshed'))
  }
}
