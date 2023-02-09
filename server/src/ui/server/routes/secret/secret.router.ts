import type { NextFunctionType } from '@server/ui/server/model/next_function.model'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { successResponse } from '../../responses/success_response'
import { onlyForEnvironmentHandler } from '../../middlewares/only_for_env.handler'
import { isEmpty, isEqual, modelValidator } from '@turnkeyid/utils-ts'
import { SecureJWT } from '@turnkeyid/utils-ts/utils'
import { createErrorResponse, isErrorResponse } from '../../responses/error_response'

export const SecretRouter = Router()

SecretRouter.get(`/parse-token`,
  onlyForEnvironmentHandler(`DEVELOPMENT`),
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { client, user } = _request.access ?? {}

      const {
        token,
        matchData,
      } = _request.body ?? {}

      modelValidator({ token }, { token: true })

      const secureJWT = SecureJWT()

      const decrypted = secureJWT.decryptToken(token)

      const match = isEqual(decrypted, matchData ?? {})

      if (isEmpty(decrypted)) {
        throw createErrorResponse({
          message: `failed to parsed`,
        })
      }

      next({
        response: {
          json: successResponse({
            data: {
              token,
              decrypted,
              match,
            },
          }),
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

SecretRouter.get(`/generate-token`,
  onlyForEnvironmentHandler(`DEVELOPMENT`),
  async (_request: Request, _response: Response, next: NextFunctionType) => {
    try {
      const { client, user } = _request.access ?? {}

      const {
        token,
        matchData,
      } = _request.body ?? {}

      modelValidator({ token }, { token: true })

      const secureJWT = SecureJWT()

      const decrypted = secureJWT.decryptToken(token)

      const match = isEqual(decrypted, matchData ?? {})

      if (isEmpty(decrypted)) {
        throw createErrorResponse({
          message: `failed to parsed`,
        })
      }

      next({
        response: {
          json: successResponse({
            data: {
              token,
              decrypted,
              match,
            },
          }),
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
