import AsyncMachine from 'asyncmachine'
import * as google from 'googleapis'
// Machine types
import {
  IBind,
  IEmit,
  IState,
  TStates
} from '../../typings/machines/google/auth'
import { IConfig } from '../types'
import { machineLogToDebug } from '../utils'

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

  // TODO (by supporting an error state?)
  Ready: IState = {
    auto: true,
    require: ['TokenRefreshed']
  }

  Error: IState = {
    drop: ['Ready']
  }

  client: any
  settings: IConfig

  constructor(config: IConfig) {
    super(null, false)
    // google.options({ params: { quotaUser: 'user123@example.com' } });
    this.settings = config
    this.register(
      'Ready',
      'CredentialsSet',
      'RefreshingToken',
      'TokenRefreshed'
    )
    this.id('Auth')
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(this)
      if (global.am_network) {
        global.am_network.addMachine(this)
      }
    }
    // TODO missing type
    this.client = new (<any>google).auth.OAuth2(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
    if (config.google.access_token && config.google.refresh_token) {
      this.add('CredentialsSet')
    } else {
      throw new Error('not-implemented')
    }
  }

  CredentialsSet_state() {
    this.client.credentials = {
      access_token: this.settings.google.access_token,
      refresh_token: this.settings.google.refresh_token
    }
  }

  RefreshingToken_state() {
    return this.client.refreshAccessToken(this.addByCallback('TokenRefreshed'))
  }
}
