import { PaymentMethodDTOUtil } from "@server/gateway/database/mikro-orm/dtos/payment_method_dto.util"
import type { RequestContext } from "@server/core/models/request_context"
import { ConfiguratorUtil } from "@turnkeyid/utils-ts/utils"
import { asyncAwaitMap, generateObjectIDString, mapToOne, ObjectIDHelper } from "@turnkeyid/utils-ts"
import { PaymentMethod } from "@server/core/domain/payment_method/models/payment_method"
import { mainLogger } from "@server/core/logger/gtnext_logger"

const _logger = mainLogger

export const PaymentMethodSeedUtil = async (
  _context: RequestContext,
) => {
  const [
    dto,
  ] = await Promise.all([
    PaymentMethodDTOUtil(_context),
  ])

  const _getSeed = async () => {
    const configUtil = ConfiguratorUtil({
      commonConfigPath: `seed_payment_method`,
      configMapper: config => mapToOne(PaymentMethod.factory, config).value,
      configName: `SEED_PAYMENT_METHOD`,
      settingOverride(currentSetting) {
        currentSetting.sessionSetting.sessionFlushOnFirstStart = true

        currentSetting.localSetting.localConfigPath = `seed_payment_method.cred.json`

        currentSetting.enabledSource.vault = false

        return currentSetting
      },
    })
    const fetch = await configUtil.fetchAll()
    return fetch.value
  }

  const seed = async () => {
    const seed = await _getSeed()
    await asyncAwaitMap(
      seed,
      async paymentMethod => {
        _logger(`PaymentMethodSeedUtil:seed`, { paymentMethod }, `info`)
        const saved = await dto.createOrUpdatePaymentMethod(
          {
            id: ObjectIDHelper.toString(paymentMethod.id)
              ?? ObjectIDHelper.toString(paymentMethod[`_id`]),
          },
          {
            ...paymentMethod,
            id: paymentMethod.id ?? generateObjectIDString(),
          })
        if (!saved.isOk)
          throw saved.error
      },
    )
  }

  return { seed }
}
