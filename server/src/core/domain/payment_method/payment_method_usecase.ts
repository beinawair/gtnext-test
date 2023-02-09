import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { RequestContext } from "@server/core/models/request_context"
import { PaymentMethodDTOUtil } from "@server/gateway/database/mikro-orm/dtos/payment_method_dto.util"
import type { ModelQueryType } from "@turnkeyid/utils-ts"
import { Result_ } from "@turnkeyid/utils-ts"
import type { PaymentMethod } from "./models/payment_method"

export const PaymentMethodUsecase = async (
  _context: RequestContext,
) => {
  const _logger = mainLogger
  const [
    paymentMethodDTO,
  ] = await Promise.all([
    PaymentMethodDTOUtil(_context),
  ])

  const fetchPaymentMethods = async (
    query?: ModelQueryType<PaymentMethod>,
  ) => {
    try {
      return await paymentMethodDTO.fetchPaymentMethods(query)
    } catch (error) {
      _logger(`fetchPaymentMethods:Err`, { error }, `error`)
      return Result_.err(error)
    }
  }

  return { fetchPaymentMethods }
}
