import config_base from '../../config'
import config_credentials from '../../config-credentials'
import * as merge from 'deepmerge'
import { IConfig, TConfigCredentials } from '../types'

const config: IConfig = <any>merge(config_base, config_credentials)

export function getConfig(user?: TConfigCredentials) {
  return user ? merge(config, user) : config
}
