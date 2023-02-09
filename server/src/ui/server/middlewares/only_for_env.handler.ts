import { createUnauthorizedResponse } from "../responses/error_response"

export const onlyForEnvironmentHandler = (environment: string) => async (_, __, next) => {
  if (process.env.NODE_ENV !== environment) {
    next({
      error: createUnauthorizedResponse({
        code: 1003,
        message: `access server error`,
      }),
    })
  }

  next()
}
