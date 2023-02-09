import type { LinkQuCallback } from "@server/core/domain/callback/models/linkqu.callback.model"
import type { NusagateInvoiceCallback, NusagateTransferCallback } from "@server/core/domain/callback/models/nusagate.callback.model"
import type { NextFunction, Request, Response } from "express"
import { Router } from "express"
import { createErrorResponse, isErrorResponse } from "../../responses/error_response"
import { successResponse } from "@server/ui/server/responses/success_response"
import type { CallbackQuery } from "@server/ui/server/model/callback_query"
import { CallbackUsecase } from "@server/core/domain/callback/callback_usecase"
import { BaseError } from "@turnkeyid/utils-ts"
import { serverConfig } from "@server/core/config/server_config"

export const PaymentGatewayRouter = Router()

PaymentGatewayRouter.get(``,
  async (_request, _res, _next) => {
    try {
      _next({
        response: {
          json: successResponse({ data: {} }),
        },
      })
    } catch (error) {
      _next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })

PaymentGatewayRouter.post(`/nusagate-callback`,
  async (_request: Request, _response: Response, _next: NextFunction) => {
    try {
      // Callback Token Verification
      if (_request.header(`x-callback-token`) !== serverConfig().payment_gateway.nusagate.callback_token) {
        throw createErrorResponse({
          message: `unauthorized request`,
          httpStatus: 401,
        })
      }

      const bodyData: NusagateInvoiceCallback | NusagateTransferCallback = _request.body
      const queryData: CallbackQuery = _request.query ?? { merchant_ids: `DEFAULT` }

      const merchant_list = queryData.merchant_ids?.split(`;`) ?? [`DEFAULT`]

      let callbackSuccess = false
      for (const merchant_id of merchant_list) {
        const useCase = await CallbackUsecase({ merchant_id })
        const result = await useCase.nusagateCallback(bodyData)
        if (result.isOk) {
          callbackSuccess = true
          break
        }
      }

      if (!callbackSuccess) {
        throw createErrorResponse({
          message: `usecase nusagate callback failed`,
        })
      }

      _response.json({
        message: `OK`,
      })
      return
    } catch (error) {
      _next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })

PaymentGatewayRouter.post(`/linkqu-callback`,
  async (_request: Request, _response: Response, _next: NextFunction) => {
    try {
      const bodyData: LinkQuCallback = _request.body
      const queryData: CallbackQuery = _request.query ?? { merchant_ids: `DEFAULT` }

      const merchant_list = queryData.merchant_ids?.split(`;`) ?? [`DEFAULT`]

      let callbackSuccess = false
      for (const merchant_id of merchant_list) {
        const useCase = await CallbackUsecase({ merchant_id })
        const result = await useCase.linkQuCallback(bodyData)
        if (result.isOk) {
          callbackSuccess = true
          break
        }
      }

      if (!callbackSuccess) {
        throw createErrorResponse({
          message: `usecase linkqu callback failed`,
        })
      }

      _response.json({
        response: `OK`,
      })
      return
    } catch (error) {
      _next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })
