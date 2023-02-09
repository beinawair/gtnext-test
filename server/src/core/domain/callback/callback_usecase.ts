import { InvoiceDTOUtil } from '@server/gateway/database/mikro-orm/dtos/invoice_dto.util'
import { BaseError, Result_ } from '@turnkeyid/utils-ts'
import type { RequestContext } from "@server/core/models/request_context"
import type { NusagateInvoiceCallback, NusagateTransferCallback } from './models/nusagate.callback.model'
import type { LinkQuCallback } from './models/linkqu.callback.model'
import { AxiosHttpClientService } from '@turnkeyid/utils-ts/utils'
import type { MerchantTransactionCallback } from '../merchant_transaction/models/merchant_transaction'
import { MerchantTransaction } from '../merchant_transaction/models/merchant_transaction'
import { mainLogger } from "@server/core/logger/gtnext_logger"
import { MerchantTransactionDTOUtil } from '@server/gateway/database/mikro-orm/dtos/merchant_transaction_dto.util'
import { wrap } from '@mikro-orm/core'

/**
 * @returns
 */
export const CallbackUsecase = async (_context: RequestContext) => {
  // const handleLinkquCallback = async (partnerReff: string) => {
  //   const _context = await getPaymentGatewayConfigByPartnerReff(partnerReff)
  //   const { merchant_id } = _context

  const [
    invoiceDTO,
    transactionDTO,
  ] = await Promise.all([
    InvoiceDTOUtil(_context),
    MerchantTransactionDTOUtil(_context),
  ])
    
  const _httpClient = new AxiosHttpClientService()
  const _sendCallback = async (callback: MerchantTransactionCallback) => {
    try {
      const result = await _httpClient.post(callback.url, callback.data ?? {})
      return Result_.ok(result)
    } catch (error) {
      mainLogger(`_sendCallback`, { error }, `error`)
      return Result_.err(error)
    }
  }

  const nusagateCallback = async (_request: NusagateInvoiceCallback | NusagateTransferCallback) => {
    try {
      const invoice = await invoiceDTO.getInvoice({ id: _request.externalId })
      if (!invoice.isOk)
        return Result_.err(invoice.error)

      // TODO: status from Nusagate
      invoice.value.status = (_request.status === `COMPLETED`) ? `PAID` : `PROCESSING`

      const update = await invoiceDTO.updateInvoice(
        { id: invoice.value.id }, { ...invoice.value },
      )

      if (!update.isOk)
        return Result_.err(update.error)

      // Hit Callback URL
      const sendCallBack = await _sendCallback(
        update.value.transaction?.callback ?? {
          url: ``,
          status: `SUCCESS`,
          data: {},
        },
      )
      if (!sendCallBack.isOk)
        mainLogger(`sendCallbackError`, sendCallBack.error)

      return invoice
    } catch (error) {
      mainLogger(`nusagateInvoiceCallback`, { error }, `error`)
      throw error
    }
  }

  const linkQuCallback = async (_request: LinkQuCallback) => {
    try {
      const invoice = await invoiceDTO.getInvoice({
        'debug.response.partner_reff': `${ _request.partner_reff }`,
      })
      if (!invoice.isOk) 
        return Result_.err(invoice.error)

      // TODO: status from LinkQU
      invoice.value.status = (_request.status === `SUCCESS`) ? `PAID` : (_request.status === `FAILED` ? `FAILED` : `PROCESSING`)  
      
      const update = await invoiceDTO.updateInvoice(
        { id: invoice.value.id }, { ...invoice.value },
      )

      if (!update.isOk)
        return Result_.err(update.error)

      // Hit Callback URL
      const sendCallBack = await _sendCallback(
        update.value.transaction?.callback ?? {
          url: ``,
          status: `SUCCESS`,
          data: {},
        },
      )
      if (!sendCallBack.isOk)
        mainLogger(`sendCallbackError`, sendCallBack.error)

      return invoice
    } catch (error) {
      mainLogger(`linkQuCallback`, { error }, `error`)
      return Result_.err(error)
    }
  }

  return { nusagateCallback, linkQuCallback }
}
