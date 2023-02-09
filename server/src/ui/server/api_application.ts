import { createServer } from 'http'
import type { Express as ApiClient } from 'express'
import express from 'express'
import { killer } from "cross-port-killer"
import { checkPort } from "get-port-please"
import cors from 'cors'
import helmet from 'helmet'
import { serverConfig } from '@server/core/config/server_config'
import type { CorsOptions } from 'vite'
import { Routes } from './routes/index.routes'
import { responseMiddlewareHandler } from './middlewares/response.middleware'
import { authorizationHandler } from './middlewares/authorization.middleware'
import { errorHandler } from './middlewares/error.handler'
import { serverLogger } from './logger/server_logger'
import { requestMiddlewareHandler } from './middlewares/request.middleware'
import { sleep } from '@turnkeyid/utils-ts'
import promMid from "express-prometheus-middleware"

export class ApiApp {
  private readonly _config = serverConfig().api

  private _provideRoutes(app: ApiClient) {
    const recursiveRoutes = (routingObject: any, prefix = ``) => {
      if (typeof routingObject === `object` && Object.keys(routingObject).length > 0) {
        for (const key of Object.keys(routingObject)) {
          const router = routingObject[key]

          if (
            // Condition for express routes
            (router?.name === `router` && typeof router === `function`)
            // For h3 routes, this is the working condition
            || (typeof router === `object` && `handler` in router && `trace` in router && `post` in router && `get` in router)
          ) {
            const endpoint = `${ prefix }${ key }`
            app.use(endpoint, router)
          } else if (typeof router === `object`) {
            recursiveRoutes(router, prefix + key)
          }
        }
      }
    }

    recursiveRoutes(Routes)
  }

  private readonly _provideMiddlewares = async (app: ApiClient) => {
    try {
      app.use(express.json())

      const corsOptions: CorsOptions = {
        origin: `*`,
        methods: `GET,HEAD,PUT,PATCH,POST,DELETE`,
        preflightContinue: true,
        optionsSuccessStatus: 204,
        allowedHeaders: `*`,
        exposedHeaders: [`Content-Disposition`, `Content-Type`, `Content-Length`, `Authorization`],
        credentials: true,
      }
      app.use(cors(corsOptions))
      app.use(helmet())
      app.use(
        promMid({
          metricsPath: `/v1/health_monitor/status`,
          collectDefaultMetrics: true,
          requestDurationBuckets: [0.1, 0.5, 1, 1.5],
          requestLengthBuckets: [512, 1024, 2048, 4096],
          responseLengthBuckets: [512, 1024, 2048, 4096],
        }),
      )
      app.enable(`trust proxy`)

      app.use(requestMiddlewareHandler)
      app.use(authorizationHandler)

      this._provideRoutes(app)

      app.use(responseMiddlewareHandler)
      app.use(errorHandler)
    } catch (error) {
      serverLogger(`_provideMiddleware:Err`, { error }, `error`)
      throw error
    }
  }

  private readonly _portClear = async () => {
    if (await checkPort(this._config.port) === false) {
      serverLogger(`killing port ${ this._config.port }`, void 0, `warn`)
      await killer.kill(this._config.port)
      await sleep(1000)
    }
  }

  public startApp = async () => {
    try {
      // Await this._portClear()
      const app = express()
      await this._provideMiddlewares(app)
      const server = createServer(app)

      server.listen(this._config.port, () => {
        serverLogger(`startApp`, { message: `\n Server started on port: ${ this._config.port }` 
        + `\n Environment: ${ process.env.NODE_ENV }` }, `info`)
      })
    } catch (error) {
      serverLogger(`startApp:Err`, { error }, `error`)
      throw error
    }
  }
}
