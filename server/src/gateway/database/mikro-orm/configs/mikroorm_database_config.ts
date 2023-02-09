import { mapToOne } from "@turnkeyid/utils-ts"
import type { ModelQueryType } from "@turnkeyid/utils-ts"
import { ConfiguratorUtil, DatabaseConfig, DatabaseError } from "@turnkeyid/utils-ts/utils"
import { serverConfig } from "@server/core/config/server_config"

export const MikroOrmDatabaseConfig = () => {
  const getConfig = async (filter: ModelQueryType<DatabaseConfig>) => {
    const _configuratorUtil = ConfiguratorUtil({
      commonConfigPath: `database_config`,
      configName: `DATABASE_CONFIG`,
      defaultFilter: {
        env: serverConfig().env,
        id: `DEFAULT`,
      },
      configMapper: config => mapToOne(DatabaseConfig.create, config).value,
      settingOverride(currentSetting) {
        currentSetting.sessionSetting.sessionFlushOnFirstStart = true

        currentSetting.localSetting.localConfigPath = `database_config.cred.json`
        currentSetting.enabledSource.vault = false
        return currentSetting
      },
    })

    const result = await _configuratorUtil.find(filter)
    if (result?.value)
      return result.value
    throw new DatabaseError({
      method: `getConfig`,
      message: `config for ${ JSON.stringify(filter) } undefined!`,
    })
  }

  return { getConfig }
}
