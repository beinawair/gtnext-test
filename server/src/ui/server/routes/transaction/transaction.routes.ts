import { MerchantTransactionUsecase } from '@server/core/domain/merchant_transaction/merchant_transaction_usecase'
import type { NextFunctionType } from '@server/ui/server/model/next_function.model'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { MerchantTransactionRequest } from '@server/core/domain/merchant_transaction/models/merchant_transaction'
import { successResponse } from '../../responses/success_response'
import { transactionAuthorizationHandler } from '../../middlewares/transaction_authorization.handler'
import { modelValidator, toNumberOrUndefined } from '@turnkeyid/utils-ts'
import { InvoiceUsecase } from '@server/core/domain/invoice/invoice_usecase'
import { createErrorResponse, createUnauthorizedResponse, isErrorResponse } from '../../responses/error_response'

export const TransactionRouter = Router()

TransactionRouter.post(`/create-transaction`,
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { client, user } = _request.access ?? {}
      if (!client?.isAuthenticated() || !client.client_id) {
        throw createUnauthorizedResponse({
          message: `unauthorized request`,
        })
      }

      const validatorData = modelValidator(MerchantTransactionRequest.factory(_request.body), {
        iframe: false,
        callback: false,
        redirect_url: false,
        order_detail: true
      })

      if (!validatorData.isOk) {
        throw createErrorResponse({
          message: `invalid data: ${ validatorData.error?.message }`,
        })
      }

      const useCase = await MerchantTransactionUsecase({
        merchant_id: client.client_id,
      })

      // mapping items type data
      validatorData.value.order_detail.items = validatorData.value.order_detail.items?.map(
        item => ({
          ...item,
          cost_base: toNumberOrUndefined(item?.cost_base),
          qty: toNumberOrUndefined(item?.qty),
          cost_alt: toNumberOrUndefined(item?.cost_alt),
          currency_rate: toNumberOrUndefined(item?.currency_rate),
        }),
      )
      const usecaseResult = await useCase.createTransaction(validatorData.value as MerchantTransactionRequest)

      if (!usecaseResult.isOk) {
        throw createErrorResponse({
          message: `usecase failed: ${ usecaseResult.error?.message }`,
        })
      }

      next({
        response: {
          json: successResponse({ data: usecaseResult.value }),
        },
      })
    } catch (error) {
      next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })

TransactionRouter.post(`/:transaction_id/create-invoice`,
  transactionAuthorizationHandler,

  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { transactional } = _request.access ?? {}
      if (!transactional?.isAuthenticated() || !transactional.transaction_id) {
        throw createUnauthorizedResponse({
          message: `unauthorized request`,
        })
      }

      const { transaction_id } = transactional
      const { transaction_id: transactionIdParameter } = _request.params

      if (transaction_id !== transactionIdParameter) {
        throw createErrorResponse({
          message: `invalid transaction id`,
        })
      }

      const validatorRequest = modelValidator({
        payment_method: _request.body?.payment_method,
        currency: _request.body?.currency,
      })
      if (!validatorRequest.isOk)
        throw createErrorResponse(`invalid data: ${ validatorRequest.error?.message }`)
      const { value: validBody } = validatorRequest

      const paymentUsecase = await InvoiceUsecase({
        merchant_id: transactional.merchant_id,
      })

      const usecaseResult = await paymentUsecase.createInvoice({
        transaction_id,
        selected_payment_method: validBody.payment_method,
        currency: validBody.currency,
      })
      if (!usecaseResult.isOk) {
        throw createErrorResponse({
          message: `usecase failed: ${ usecaseResult.error?.message }`,
        })
      }

      next({
        response: {
          json: successResponse({ data: usecaseResult.value }), 
        },
      })
    } catch (error) {
      next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })

TransactionRouter.get(`/get`,
  transactionAuthorizationHandler,

  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { transactional } = _request.access ?? {}
      if (!transactional?.isAuthenticated() || !transactional.transaction_id) {
        throw createUnauthorizedResponse({
          message: `unauthorized request`,
        })
      }

      const { transaction_id } = transactional

      const transactionUsecase = await MerchantTransactionUsecase({
        merchant_id: transactional.merchant_id,
      })

      const usecaseResult = await transactionUsecase.getTransactionByID(transaction_id)
      if (!usecaseResult.isOk) {
        throw createErrorResponse({
          message: `usecase failed: ${ usecaseResult.error?.message }`,
        })
      }

      next({
        response: {
          json: successResponse({ data: usecaseResult.value }), 
        },
      })
    } catch (error) {
      next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  },
)
