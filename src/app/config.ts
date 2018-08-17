import config_base from '../../config'
import config_credentials from '../../config-private'
import * as merge from 'deepmerge'
import { IConfig, IConfigPrivate } from '../types'

const config: IConfig = <any>merge(config_base, config_credentials)

export function getConfig(user?: IConfigPrivate) {
  return user ? merge(config, user) : config
}
