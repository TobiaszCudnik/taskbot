import config_base from '../../config'
import config_credentials from '../../config-private'
import * as merge from 'deepmerge'
import { IConfig, IConfigAccount } from '../types'

const config: IConfig = <any>merge(config_base, config_credentials)

export function getConfig(user?: IConfigAccount) {
  return user ? merge(config, user) : config
}
