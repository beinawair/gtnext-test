import type { MerchantTransaction } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import type { RequestContext } from "@server/core/models/request_context"
import type { DeepPartial, ModelQueryType } from "@turnkeyid/utils-ts"
import { isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { DatabaseDTOError } from "@turnkeyid/utils-ts/utils"
import { MerchantTransactionEntity } from "../entities/merchant_transaction.entity"
import { GtNextBaseDatabaseOrm } from "../utils/gtnext_base_database_orm"

export const MerchantTransactionDTOUtil = async (
  _context: RequestContext,
) => {
  const _base = GtNextBaseDatabaseOrm<MerchantTransaction, MerchantTransactionEntity>({
    clientID: _context.merchant_id,
  }, MerchantTransactionEntity)

  _base.setModelMapper(MerchantTransactionEntity.mapToModel)

  const addTransaction = async (transaction: MerchantTransaction) => {
    try {
      const created = await _base.create({ ...transaction })
      if (isEmpty(created))
        return Result_.err(`[addTransaction]: add ${ transaction.id } failed`)
      return Result_.ok(created)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `addTransaction`,
        error,
      }))
    }
  }

  const getTransaction = async (
    query: ModelQueryType<MerchantTransaction>,
  ) => {
    try {
      const get = await _base.findOne(query)
      if (isEmpty(get))
        return Result_.err(`[getTransaction]: get ${ JSON.stringify(get) } failed`)
      return Result_.ok(get)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `getTransaction`,
        error,
      }))
    }
  }

  const updateTransaction = async (
    query: ModelQueryType<MerchantTransaction>,
    updateInput: DeepPartial<MerchantTransaction>,
  ) => {
    try {
      const updated = await _base.update(query, { ...updateInput })
      if (isEmpty(updated))
        return Result_.err(`[updateTransaction]: get ${ JSON.stringify(query) } failed`)
      return Result_.ok(updated)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `updateTransaction`,
        error,
      }))
    }
  }

  const updateTransactionCallbackHistory = async (
    query: ModelQueryType<MerchantTransaction>,
    history: string,
  ) => {
    try {
      const exist = await _base.findOne(query)
      const updated = await _base.update(query, { 
        callback: {
          histories: [
            ...exist?.callback?.histories ?? [],
            history,
          ],
        },
      })
      if (isEmpty(updated))
        return Result_.err(`[updateTransaction]: get ${ JSON.stringify(query) } failed`)
      return Result_.ok(updated)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `updateTransaction`,
        error,
      }))
    }
  }

  const deleteTransaction = async (
    filter: ModelQueryType<MerchantTransaction>,
  ) => {
    try {
      const deleting = await _base.deleteOne(filter)
      return Result_.ok(`delete ${ JSON.stringify(filter) } ok`)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `deleteTransaction`,
          error,
        }),
      )
    }
  }

  return {
    addTransaction,
    getTransaction,
    updateTransaction,
    updateTransactionCallbackHistory,
    deleteTransaction,
  }
}
