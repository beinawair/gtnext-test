import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { RequestContext } from "@server/core/models/request_context"
import { MerchantTransactionDTOUtil } from "@server/gateway/database/mikro-orm/dtos/merchant_transaction_dto.util"
import { InvoiceDTOUtil } from "@server/gateway/database/mikro-orm/dtos/invoice_dto.util"
import type { Result } from "@turnkeyid/utils-ts"
import { generateObjectIDString, isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { PaymentGatewayUsecase } from "../payment_gateway/payment_gateway.usecase"
import { PaymentMethod } from "../payment_method/models/payment_method"
import type { NewInvoiceRequest } from "./models/invoice.model"
import { Invoice } from "./models/invoice.model"
import { isMetMinimumAmount } from "./utils/invoice_util"
import { PaymentMethodDTOUtil } from "@server/gateway/database/mikro-orm/dtos/payment_method_dto.util"

export const InvoiceUsecase = async (
  _context: RequestContext,
) => {
  const _logger = mainLogger

  const [
    invoiceDTO,
    merchantTransactionDTO,
    paymentGatewayUsecase,
    paymentMethodDTO,
  ] = await Promise.all([
    InvoiceDTOUtil(_context),
    MerchantTransactionDTOUtil(_context),
    PaymentGatewayUsecase(_context),
    PaymentMethodDTOUtil(_context),
  ])

  const createInvoice = async (
    _request: NewInvoiceRequest,
  ): Promise<Result<Invoice>> => {
    try {
      const { selected_payment_method } = _request
      const transactionResult = await merchantTransactionDTO.getTransaction({
        id: _request.transaction_id,
      })
      if (!transactionResult.isOk)
        return transactionResult
      const { value: transaction } = transactionResult

      const paymentMethodResult = await paymentMethodDTO.getPaymentMethod(
        {
          gateway_id: selected_payment_method.gateway_id,
          type: selected_payment_method.type,
          id: selected_payment_method.id,
        },
      )
      if (!paymentMethodResult.isOk)
        throw paymentMethodResult.error

      const { value: paymentMethod } = paymentMethodResult

      let newInvoice = Invoice.factory({
        pay_amount: 0,
        admin_fee: 0,
        request_amount: 0,
        // detect if payment method crypto, check if the payment currency in USD
        currency:
          selected_payment_method.type === `CRYPTO`
            ? `USD`
            : `IDR`,
        ..._request,
        selected_payment_method: paymentMethod,
        id: generateObjectIDString(),
        status: `UNPAID`,
      })

      newInvoice.request_amount
        = newInvoice.currency === `IDR`
          ? transaction.order_detail.total.cost_base
          : transaction.order_detail.total.cost_alt

      const minimumAmountValidate = isMetMinimumAmount(newInvoice)
      if (!minimumAmountValidate.isOk)
        return minimumAmountValidate

      newInvoice.transaction = transaction
      newInvoice.selected_payment_method = PaymentMethod.factory(newInvoice.selected_payment_method)

      const addResult = await invoiceDTO.createInvoice(newInvoice)
      if (!addResult.isOk)
        throw addResult.error
      newInvoice = addResult.value

      if (isEmpty(newInvoice.selected_payment_method))
        return Result_.err(`payment method cannot empty`)

      switch (newInvoice.selected_payment_method.type) {
        case `CRYPTO`: {
          const result = await paymentGatewayUsecase.createCryptoInvoice(newInvoice)
          await merchantTransactionDTO.updateTransactionCallbackHistory(
            { id: newInvoice.transaction_id },
            `crypto_payment_requested`,
          )
          return Result_.ok(result)
        }

        case `VA`: {
          const result = await paymentGatewayUsecase.createVAInvoice(newInvoice)
          await merchantTransactionDTO.updateTransactionCallbackHistory(
            { id: newInvoice.transaction_id },
            `va_payment_requested`,
          )
          return Result_.ok(result)
        }

        case `DIRECT_BANK`: {
          const result = await paymentGatewayUsecase.createDirectInvoice(newInvoice)
          await merchantTransactionDTO.updateTransactionCallbackHistory(
            { id: newInvoice.transaction_id },
            `direct_bank_payment_requested`,
          )
          return Result_.ok(result)
        }

        default: {
          throw new Error(`payment method not handled!`)
        }
      }
    } catch (error) {
      _logger(`createPayment:Err`, { error }, `error`)
      return Result_.err(error)
    }
  }

  return {
    createInvoice,
  }
}
