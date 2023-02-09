import type { InvoiceCryptoDetails, InvoiceVADetails } from "@server/core/domain/invoice/models/invoice.model"
import { Invoice } from "@server/core/domain/invoice/models/invoice.model"
import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { RequestContext } from "@server/core/models/request_context"
import { InvoiceDTOUtil } from "@server/gateway/database/mikro-orm/dtos/invoice_dto.util"
import { LinkQUApi } from "@server/gateway/payment_gateways/linkqu/linkqu_api"
import { NusagateApi } from "@server/gateway/payment_gateways/nusagate/nusagate_api"
import type { DeepPartial, ModelQueryType, Result } from "@turnkeyid/utils-ts"
import { toNumberOrUndefined, textFormatFactory, BaseError, getDateOffset } from "@turnkeyid/utils-ts"
import { getDirectBankConfig } from "./configs/direct_bank_config.util"
import type { CreateInvoiceRequest } from "./models/create_invoice"

export const PaymentGatewayUsecase = async (
  _context: RequestContext,
) => {
  const [
    nusagateApi,
    linkQUApi,
    invoiceDTO,
  ] = await Promise.all([
    NusagateApi(_context),
    LinkQUApi(_context),
    InvoiceDTOUtil(_context),
  ])

  const _updateInvoice = async (
    request: {
      method: string;
      filter: ModelQueryType<Invoice>;
      updateData: DeepPartial<Invoice>;
      publicMessage?: string;
      rollback?: Invoice;
      customError?: BaseError;
    },
  ) => {
    const { filter, method, updateData, customError, publicMessage, rollback } = request
    const updatePayment = await invoiceDTO.updateInvoice(filter, updateData)
    if (!updatePayment.isOk) {
      rollback && (await _rollbackPaymentHelper(rollback).rollbackPayment())
      throw customError ?? new BaseError({
        ...updatePayment.error,
        method,
        public_message: publicMessage,
      })
    }

    return updatePayment.value
  }

  const _rollbackPaymentHelper = (
    initInvoice: Invoice,
  ) => {
    const rollbackPayment = async () => {
      const result = await invoiceDTO.updateInvoice({ id: initInvoice.id }, initInvoice)
      if (!result.isOk) {
        throw new BaseError({
          method: `_rollbackPayment`,
          public_message: `error when rollback payment id: ${ initInvoice.id }`,
        })
      }

      return result.value
    }

    return { rollbackPayment, initialPayment: initInvoice }
  }

  const createCryptoInvoice = async (
    invoice: Invoice,
  ): Promise<Invoice<InvoiceCryptoDetails>> => {
    try {
      const [invoiceProxy, initInvoice] = [{ ...invoice } as Invoice<InvoiceCryptoDetails>, invoice]

      const adminFee = nusagateApi.getConfig()?.admin_fee ?? 0

      const { transaction } = Invoice.getValidRelation(invoiceProxy)

      invoiceProxy.admin_fee = adminFee

      invoiceProxy.pay_amount = (toNumberOrUndefined(invoiceProxy.request_amount) ?? 0) + (toNumberOrUndefined(invoiceProxy.admin_fee) ?? 0)
      const request = {
        externalId: `${ invoiceProxy.id }`,
        description: `Pay ${ invoiceProxy.pay_amount } for payment id ${ invoiceProxy.id }`,
        price: invoiceProxy.pay_amount,
        dueDate: getDateOffset(Date.now(), 3, `h`).toDate(),
        email: transaction.user_detail.email,
        phoneNumber: `${ transaction.user_detail.phone }`,
      }

      const result = await nusagateApi.createPaymentCrypto(request)
      if (!result.isOk) {
        throw new BaseError({
          ...result.error,
          method: `createCryptoInvoice`,
          debug: { ...result.error?.debug, request },
        })
      }

      invoiceProxy.details = {
        ...result.value.data,
      }

      invoiceProxy.debug = { response: result.value }
      invoiceProxy.pay_amount = toNumberOrUndefined(result.value.data.price) ?? invoiceProxy.pay_amount
      invoiceProxy.payment_link = result.value.data.paymentLink

      const updatePayment = await _updateInvoice({
        filter: { id: invoiceProxy.id },
        method: `createCryptoInvoice`,
        updateData: invoiceProxy,
      })

      return updatePayment as Invoice<InvoiceCryptoDetails>
    } catch (error) {
      mainLogger(`createCryptoPayment`, { error }, `error`)
      throw error
    }
  }

  const createDirectInvoice = async (
    invoice: Invoice,
  ) => {
    try {
      const [invoiceProxy, initInvoice] = [{ ...invoice }, invoice]

      const config = await getDirectBankConfig({
        merchant_id: _context.merchant_id,
      })
      if (!config)
        throw new Error(`direct bank config not found`)

      const payment_link = textFormatFactory({
        default_format: config.additional_config.payment_link_format,
      }).textFormat({
        payment: invoiceProxy,
      })

      // !TODO: make it configurable, config for direct payment
      const adminFee = 0

      invoiceProxy.admin_fee = adminFee

      invoiceProxy.pay_amount = (toNumberOrUndefined(invoiceProxy.request_amount) ?? 0) + (toNumberOrUndefined(invoiceProxy.admin_fee) ?? 0)
      Object.assign(invoiceProxy, {
        ...invoiceProxy,
        payment_link,
      })

      const updateInvoice = await _updateInvoice({
        filter: { id: invoiceProxy.id },
        method: `createDirectInvoice`,
        updateData: invoiceProxy,
      })

      return updateInvoice
    } catch (error) {
      mainLogger(`createDirectInvoice`, { error }, `error`)
      throw error
    }
  }

  const createVAInvoice = async (
    payment: Invoice,
  ): Promise<Invoice<InvoiceVADetails>> => {
    try {
      const [invoiceProxy, initialInvoice] = [{ ...payment } as Invoice<InvoiceVADetails>, payment]
      const adminFee = linkQUApi.getConfig()?.admin_fee

      const { transaction } = Invoice.getValidRelation(payment)

      invoiceProxy.admin_fee = adminFee

      invoiceProxy.pay_amount = (toNumberOrUndefined(invoiceProxy.request_amount) ?? 0) + (toNumberOrUndefined(invoiceProxy.admin_fee) ?? 0)
      const request: CreateInvoiceRequest = {
        amount: invoiceProxy.pay_amount,
        customer_email: transaction.user_detail.email,
        customer_id: transaction.user_detail.email,
        customer_name: transaction.user_detail.name,
        customer_phone: transaction.user_detail.phone,
        expired: transaction.expired_datetime,
        payment_method: invoiceProxy.selected_payment_method,

      }

      const result = await linkQUApi.createVirtualPayment(request)
      if (!result.isOk) {
        throw new BaseError({
          ...result.error,
          method: `createVAInvoice`,
          debug: { ...result.error?.debug, request },
        })
      }

      invoiceProxy.details = {
        ...result.value,
      }

      invoiceProxy.debug = { response: result.value }
      invoiceProxy.pay_amount = result.value.amount

      const updatePayment = await _updateInvoice({
        filter: { id: invoiceProxy.id },
        method: `createVAInvoice`,
        updateData: invoiceProxy,
      })

      return updatePayment as Invoice<InvoiceVADetails>
    } catch (error) {
      mainLogger(`createVAInvoice`, { error }, `error`)
      throw error
    }
  }

  return {
    createCryptoInvoice,
    createVAInvoice,
    createDirectInvoice,
  }
}
