import type { NextFunctionType } from '@server/ui/server/model/next_function.model'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { successResponse } from '../../responses/success_response'

import { onlyForEnvironmentHandler } from '../../middlewares/only_for_env.handler'
import type { MerchantAuth } from '../../middlewares/models/merchant_auth_payload'
import { getDateOffset, isEmpty, modelValidator } from '@turnkeyid/utils-ts'
import { SecureJWT } from '@turnkeyid/utils-ts/utils'
import { createErrorResponse, isErrorResponse } from '../../responses/error_response'

export const MerchantRouter = Router()

MerchantRouter.post(`/register-merchant`,
  onlyForEnvironmentHandler(`DEVELOPMENT`),
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { client, user } = _request.access ?? {}

      const validRequestBody = modelValidator(_request.body ?? {}, {
        merchant_id: true,
        environment: true,
        allow_origin: true,
        expired: true,
        scope: true,
      })
      if (!validRequestBody.isOk) {
        throw createErrorResponse({
          message: validRequestBody.error?.message,
          public_message: `invalid input!`,
          debug: {
            validatorError: validRequestBody.error,
          },
        })
      }

      const {
        merchant_id,
        environment,
        allow_origin,
        expired,
      } = validRequestBody.value

      const secureJWT = SecureJWT()

      const tokenExpiredMS = !isEmpty(expired)
        ? Number(expired)
        : getDateOffset(Date.now(), 1, `year`).valueOf()

      const token = secureJWT.encryptPayload<MerchantAuth>({
        merchant_id,
        environment,
        scope: `PUBLIC`,
        expired: tokenExpiredMS,
        exp_date: new Date(tokenExpiredMS),
        allow_origin,
      }, {
        expiresIn: Math.floor((tokenExpiredMS - Date.now()) / 1e3), // Convert to unix (epoch seconds)
      })

      if (isEmpty(token)) {
        throw createErrorResponse({
          message: `create token failed`,
        })
      }

      next({
        response: {
          json: successResponse({ data: { token, input: _request.body, expired: tokenExpiredMS } }),
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
