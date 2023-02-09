import type { RequestContext } from "@server/core/models/request_context"
import { LinkQuConfig } from "@server/gateway/payment_gateways/linkqu/config/linkqu_config"
import { mapToOne } from "@turnkeyid/utils-ts"
import { ConfiguratorUtil } from "@turnkeyid/utils-ts/utils"

export const getLinkQuConfig = async (_context: RequestContext) => {
  const util = ConfiguratorUtil({
    commonConfigPath: `payment_gateway_config`,
    configMapper: config => mapToOne(LinkQuConfig.factory, config).value,
    configName: `LINKQU_CONFIG`,
    settingOverride(currentSetting) {
      currentSetting.sessionSetting.sessionFlushOnFirstStart = true

      currentSetting.localSetting.localConfigPath = `payment_gateway_config.cred.json`

      currentSetting.enabledSource.vault = false
      return currentSetting
    },
  })
  const found = await util.find({
    merchant_id: _context.merchant_id,
    gateway_id: `LINKQU`,
  })
  return found?.value
}
