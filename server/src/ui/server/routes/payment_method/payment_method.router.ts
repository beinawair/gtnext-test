import { PaymentMethodUsecase } from '@server/core/domain/payment_method/payment_method_usecase'
import type { NextFunctionType } from '@server/ui/server/model/next_function.model'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { successResponse } from '../../responses/success_response'
import { transactionAuthorizationHandler } from '../../middlewares/transaction_authorization.handler'
import { createErrorResponse, isErrorResponse } from '../../responses/error_response'

export const PaymentMethodRouter = Router()

PaymentMethodRouter.get(`/`,
  transactionAuthorizationHandler,
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { transactional } = _request.access ?? {}
      if (!transactional?.isAuthenticated() || !transactional.transaction_id) {
        throw createErrorResponse({
          message: `unauthorized request`,
          httpStatus: 401,
        })
      }

      const useCase = await PaymentMethodUsecase({
        merchant_id: transactional.merchant_id,
      })

      const usecaseResult = await useCase.fetchPaymentMethods()

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

PaymentMethodRouter.post(`/`,
  transactionAuthorizationHandler,
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { user, merchant } = _request?.access ?? {}

      if (!user?.isAuthenticated() || !user.id) {
        throw createErrorResponse({
          message: `unauthorized request`,
          httpStatus: 401,
        })
      }

      if (!merchant?.id) {
        throw createErrorResponse({
          message: `unauthorized request`,
          httpStatus: 401,
        })
      }

      next({
        response: {
          raw: `NOT IMPLEMENTED`,
        },
      })

      // const useCase = await PaymentMethodUsecase({
      //   merchant_id: merchant?.id,
      // })

      // const usecaseResult = await useCase.fetchPaymentMethods()

      // if (!usecaseResult.isOk) {
      //   throw createErrorResponse({
      //     message: `usecase failed: ${ usecaseResult.error?.message }`,
      //   })
      // }

      // next({
      //   response: {
      //     json: successResponse({ data: usecaseResult.value }),
      //   },
      // })
    } catch (error) {
      next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })
