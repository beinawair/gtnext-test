import type { RequestContext } from "@server/core/models/request_context"
import { InvoiceDTOUtil } from "@server/gateway/database/mikro-orm/dtos/invoice_dto.util"
import { Result_ } from "@turnkeyid/utils-ts"
import { DomainError } from "../../_common/domain_error"
import type { Invoice } from "../models/invoice.model"

export const invoiceRelationUtil = async (
  _context: RequestContext,
) => {
  const [
    paymentDTO,
  ] = await Promise.all([
    InvoiceDTOUtil(_context),
  ])
  const populatePayment = async (
    payment: Invoice,
  ) => {
    try {
      if (!payment.transaction) {
        const getPayment = await paymentDTO.getInvoice({ id: payment.id })
        payment.transaction = getPayment.value?.transaction
        if (!payment.transaction) {
          throw new DomainError({
            message: `populate payment failed`,
            debug: { payment },
          })
        }
      }

      return payment
    } catch (error) {
      throw error
    }
  }

  return { populatePayment }
}

export const isMetMinimumAmount = (invoice?: Invoice) => {
  const { admin_fee, minimum_amount } = invoice?.selected_payment_method.requirement ?? {}
  if (
    invoice?.currency === `IDR`
    && (Number(invoice?.request_amount ?? 0) < (minimum_amount?.idr ?? 0))
  )
    return Result_.err(`invalid request, requested amount (${ invoice.request_amount }) must be larger than ${ minimum_amount?.idr ?? 0 } `)
  if (
    invoice?.currency === `USD`
    && (Number(invoice?.request_amount ?? 0) < (minimum_amount?.usd ?? 0))
  )
    return Result_.err(`invalid request, requested amount (${ invoice.request_amount }) must be larger than ${ minimum_amount?.usd ?? 0 } `)
  return Result_.ok(`ok`)
}

