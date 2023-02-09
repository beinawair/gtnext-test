import type { Invoice } from "@server/core/domain/invoice/models/invoice.model"
import type { RequestContext } from "@server/core/models/request_context"
import type { DeepPartial, ModelQueryType } from "@turnkeyid/utils-ts"
import { isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { DatabaseDTOError } from "@turnkeyid/utils-ts/utils"
import { InvoiceEntity } from "../entities/invoice.entity"
import { GtNextBaseDatabaseOrm } from "../utils/gtnext_base_database_orm"

export const InvoiceDTOUtil = async (
  _context: RequestContext,
) => {
  const _base = GtNextBaseDatabaseOrm<Invoice, InvoiceEntity>({
    clientID: _context.merchant_id,
  }, InvoiceEntity)

  _base.setModelMapper(InvoiceEntity.mapToModel)

  const createInvoice = async (
    model: Invoice,
  ) => {
    try {
      const created = await _base.create({ ...model }, { populate: true })
      if (isEmpty(created))
        return Result_.err(`createInvoice:Err - add ${ JSON.stringify(model) } failed`)
      return Result_.ok(created)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `createInvoice`,
        error,
      }))
    }
  }

  const getInvoice = async (
    query: ModelQueryType<Invoice>,
  ) => {
    try { 
      const get = await _base.findOne(query, {
        populate: true,
      })
      if (isEmpty(get))
        return Result_.err(`getInvoice:Err - get ${ JSON.stringify(query) } failed`)
      return Result_.ok(get)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `getInvoice`,
        error,
      }))
    }
  }

  const updateInvoice = async (
    query: ModelQueryType<Invoice>,
    updateInput: DeepPartial<Invoice>,
  ) => {
    try {
      const updated = await _base.update(query, { ...updateInput })
      if (isEmpty(updated))
        return Result_.err(`updateInvoice:Err - get ${ JSON.stringify(query) } failed`)
      return Result_.ok(updated)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `updateInvoice`,
        error,
      }))
    }
  }

  const fetchAllInvoices = async () => {
    try {
      const fetch = await _base.fetchAll()
      if (!isEmpty(fetch))
        return Result_.ok(fetch)

      throw new Error(`fetchAllInvoices:Err - failed to fetch all payments`)
    } catch (error) {
      return Result_.err(new DatabaseDTOError({
        method: `fetchAllInvoices`,
        error,
      }))
    }
  }

  const deleteInvoice = async (
    filter: ModelQueryType<Invoice>,
  ) => {
    try {
      const deleting = await _base.deleteOne(filter)
      return Result_.ok(`delete ${ JSON.stringify(filter) } ok`)
    } catch (error) {
      return Result_.err(
        new DatabaseDTOError({
          method: `deleteInvoice`,
          error,
        }),
      )
    }
  }

  return {
    fetchAllInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  }
}
