import type { TransactionTokenPayload } from "@server/core/domain/merchant_transaction/models/transaction_token"
import { AccessPrincipal, AccessTransactionalPrincipal } from "@server/ui/models/access"
import type { Request, Response } from "express"
import type { NextFunctionType } from "../model/next_function.model"
import { createUnauthorizedResponse } from "../responses/error_response"
import { AuthorizationMiddleware } from "./authorization.middleware"

export const transactionAuthorizationHandler = async (request_: Request, response_: Response, next_: NextFunctionType) => {
  try {
    const auth = await AuthorizationMiddleware()

    const loadTransactionalAccess = () => {
      const transTokenResult = auth.getTokenFromRequest<TransactionTokenPayload>(
        request_,
        [`Authorization`],
      )
      if (transTokenResult.isOk) {
        const {
          data: {
            environment,
            merchant_id,
            allow_origin,
            transaction_id,
            scope,
            expired,
            allow_origin: allowOrigin,
          },
          token,
        } = transTokenResult.value

        if (environment !== process.env.NODE_ENV) {
          throw createUnauthorizedResponse({
            code: 1004,
            name: `UNAUTHORIZED`,
            message: `token invalid`,
          })
        }

        if (expired < Date.now()) {
          // Access is expired
          throw createUnauthorizedResponse({
            code: 1005,
            name: `UNAUTHORIZED`,
            message: `expired`,
          })
        }

        const access = new AccessPrincipal()
        access.transactional = AccessTransactionalPrincipal.factory_({
          allow_origin,
          merchant_id,
          transaction_id,
          environment,
          scope,
          expired,
        })

        access.client = request_.access?.client
        access.user = request_.access?.user

        request_.access = access
      }
    }

    loadTransactionalAccess()

    next_()
  } catch (error) {
    next_({ error })
  }
}
