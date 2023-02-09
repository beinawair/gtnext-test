import { serverConfig } from "@server/core/config/server_config"
import type { ModelQueryType } from "@turnkeyid/utils-ts"
import { mapToOne } from "@turnkeyid/utils-ts"
import { ConfiguratorUtil } from "@turnkeyid/utils-ts/utils"
import { DirectTransferConfig } from "../models/direct_bank_config.model"

export const getDirectBankConfig = async (
  filter: ModelQueryType<DirectTransferConfig>,
) => {
  const _configurator = ConfiguratorUtil({
    commonConfigPath: `payment_gateway_config`,
    configMapper(config) {
      return mapToOne(DirectTransferConfig.factory, config).value
    },
    defaultFilter: {
      merchant_id: `DEFAULT`,
      gateway_id: filter?.[`gateway_id`] ?? `DIRECT_BANK`,
      environment: serverConfig().env,
    },
    configName: `PAYMENT_GATEWAY_CONFIG`,
    settingOverride(currentSetting) {
      currentSetting.sessionSetting.sessionFlushOnFirstStart = true

      currentSetting.localSetting.localConfigPath = `payment_gateway_config.cred.json`

      currentSetting.enabledSource.vault = false
      return currentSetting
    },
  })

  const config = await _configurator.find({
    ...filter,
    gateway_id: `DIRECT_BANK`,
  })
  return config?.value
}
