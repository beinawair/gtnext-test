
import { serverConfig } from '@server/core//config/server_config'
import { ConfiguratorUtil } from '@turnkeyid/utils-ts/utils'

export type DriverConfig = {
  [key: string]: string;
  driver_type: string;
}

export class NotificationConfig {
  constructor(
    public id: string,
    public env: string,
    public message_format: Record<string, string>,
    public driver_config: Record<string, DriverConfig>,
  ) {}
}

export const getNotifConfigById = async (id: string) => {
  const util = ConfiguratorUtil<NotificationConfig>({
    commonConfigPath: `notificaiton_config`,
    configMapper(config) {
      return config as any
    },
    configName: `NOTIFICATION_CONFIG`,
    settingOverride(currentSetting) {
      currentSetting.sessionSetting.sessionFlushOnFirstStart = true

      currentSetting.localSetting.localConfigPath = `notification_config.cred.json`
      currentSetting.enabledSource.vault = false
      return currentSetting
    },
  })

  const result = await util.find({
    env: serverConfig().env,
    id,
  })
  return result?.value
}
