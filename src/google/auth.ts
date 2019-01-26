import AsyncMachine from 'asyncmachine'
import { OAuth2Client } from 'google-auth-library'
// Machine types
import {
  IBind,
  IEmit,
  IState,
  TStates
} from '../../typings/machines/google/auth'
import Logger from '../app/logger'
import { IConfig, IConfigAccountGoogle, IConfigPrivateGoogle } from '../types'
import { machineLogToDebug } from '../utils'

// TODO add logging
// TODO compose asyncmachine
export default class Auth extends AsyncMachine<TStates, IBind, IEmit> {
  Enabled: IState = {}
  CredentialsSet: IState = {}
  RefreshingToken: IState = {
    // auto: true,
    require: ['CredentialsSet', 'Enabled'],
    drop: ['TokenRefreshed']
  }
  TokenRefreshed: IState = {
    auto: true,
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

  client: OAuth2Client
  config: IConfigAccountGoogle & IConfigPrivateGoogle

  constructor(
    config: IConfigAccountGoogle & IConfigPrivateGoogle,
    user_id: string,
    logger: Logger
  ) {
    super(null, false)
    // google.options({ params: { quotaUser: 'user123@example.com' } });
    this.config = config
    this.register(
      'Ready',
      'CredentialsSet',
      'RefreshingToken',
      'TokenRefreshed',
      'Enabled'
    )
    this.id('Google Auth')
    machineLogToDebug(logger, this, user_id)
    // TODO avoid globals
    if (process.env['DEBUG_AM'] || global.am_network) {
      if (global.am_network) {
        global.am_network.addMachine(this)
      }
    }
    // support mocked APIs
    if (process.env['MOCK']) {
      this.log('Mocking GoogleAuth')
      this.add(['TokenRefreshed', 'CredentialsSet'])
      return
    }
    this.client = new OAuth2Client(
      config.client_id,
      config.client_secret,
      config.redirect_url
    )
    if (config.access_token && config.refresh_token) {
      this.add('CredentialsSet', config.access_token, config.refresh_token)
    } else {
      throw new Error('No google access tokens')
    }
  }

  CredentialsSet_state(access_token: string, refresh_token: string) {
    if (process.env['MOCK']) {
      return
    }
    this.client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    })
  }

  RefreshingToken_state() {
    return this.client.refreshAccessToken(this.addByCallback('TokenRefreshed'))
  }

  Exception_state(err) {
    switch (err.code) {
      case 'invalid_grant':
        this.log('Invalid token grant')
        // TODO redo the token
        break
    }
  }
}
