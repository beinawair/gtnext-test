import { serverConfig } from "@server/core/config/server_config"
import { NusagateConfig } from "@server/gateway/payment_gateways/nusagate/models/nusagate_config.port"
import type { ModelQueryType } from "@turnkeyid/utils-ts"
import { mapToOne } from "@turnkeyid/utils-ts"
import { ConfiguratorUtil } from "@turnkeyid/utils-ts/utils"

export const getNusagateConfig = async (
  filter: ModelQueryType<NusagateConfig>,
) => {
  const _configurator = ConfiguratorUtil({
    commonConfigPath: `payment_gateway_config`,
    configMapper(config) {
      return mapToOne(NusagateConfig.factory, config).value
    },
    defaultFilter: {
      merchant_id: `DEFAULT`,
      gateway_id: filter?.[`gateway_id`],
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
    gateway_id: `NUSAGATE`,
  })
  return config?.value
}
