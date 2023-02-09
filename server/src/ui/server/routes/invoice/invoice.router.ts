import { Router } from "express"
import { createErrorResponse, isErrorResponse } from "../../responses/error_response"

export const InvoiceRouter = Router()

InvoiceRouter.get(``,
  async (_request, _res, _next) => {
    try {} catch (error) {
      _next({
        error: isErrorResponse(error)
          ? error
          : createErrorResponse({ error }),
      })
    }
  })
