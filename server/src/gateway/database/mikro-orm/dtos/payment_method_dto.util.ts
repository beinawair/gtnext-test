import type { PaymentMethod } from "@server/core/domain/payment_method/models/payment_method"
import type { RequestContext } from "@server/core/models/request_context"
import type { ModelQueryType } from "@turnkeyid/utils-ts"
import { isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { DatabaseDTOError } from "@turnkeyid/utils-ts/utils"
import { PaymentMethodEntity } from "../entities/payment_method.entity"
import { GtNextBaseDatabaseOrm } from "../utils/gtnext_base_database_orm"

export const PaymentMethodDTOUtil = async (
  _context: RequestContext,
) => {
  const _base = GtNextBaseDatabaseOrm<PaymentMethod, PaymentMethodEntity>({
    clientID: _context.merchant_id,
  }, PaymentMethodEntity)

  _base.setModelMapper(PaymentMethodEntity.mapToModel)

  const createPaymentMethod = async (paymentMethod: PaymentMethod) => {
    try {
      const created = await _base.create({ ...paymentMethod })
      if (isEmpty(created))
        return Result_.err(`createPaymentMethod:Err add ${ JSON.stringify(paymentMethod) } failed`)
      return Result_.ok(created)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `createPaymentMethod`,
          error,
        }),
      )
    }
  }

  const createOrUpdatePaymentMethod = async (filter: ModelQueryType<PaymentMethod>, updatedData: PaymentMethod) => {
    try {
      const createOrUpdated = await _base.createOrUpdate(filter, { ...updatedData })
      if (isEmpty(createOrUpdated))
        return Result_.err(`createOrUpdatePaymentMethod:Err - ${ JSON.stringify(filter) } failed`)
      return Result_.ok(createOrUpdated)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `createOrUpdatePaymentMethod`,
          error,
        }),
      )
    }
  }

  const fetchPaymentMethods = async (
    query?: ModelQueryType<PaymentMethod>,
  ) => {
    try {
      const fetch = await _base.fetch(query ?? {})
      if (isEmpty(fetch))
        return Result_.err(`fetchPaymentMethods:Err ${ JSON.stringify(query) } failed`)
      return Result_.ok(fetch)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `fetchPaymentMethods`,
          error,
        }),
      )
    }
  }

  const getPaymentMethod = async (
    query?: ModelQueryType<PaymentMethod>,
  ) => {
    try {
      const get = await _base.findOne(query ?? {})
      if (isEmpty(get))
        return Result_.err(`fetchPaymentMethods:Err ${ JSON.stringify(query) } failed`)
      return Result_.ok(get)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `fetchPaymentMethods`,
          error,
        }),
      )
    }
  }

  return {
    fetchPaymentMethods,
    getPaymentMethod,
    createPaymentMethod,
    createOrUpdatePaymentMethod,
  }
}
