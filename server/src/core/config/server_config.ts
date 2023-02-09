import { nonNullValue } from "@turnkeyid/utils-ts"
import { mainLogger } from "@server/core/logger/gtnext_logger"

export const serverConfig = () => ({
  env: process.env.NODE_ENV,
  merchant: {
    transaction_checkout_url: `${ nonNullValue(process.env.TRANSACTION_CHECKOUT_URL) }`,
  },
  api: {
    port: Number(process.env.API_PORT ?? 8000),
    env: process.env.NODE_ENV ?? `development`,
  },
  payment_gateway: {
    nusagate: {
      callback_token: process.env.NUSAGATE_CALLBACK_TOKEN,
    },
  },
})

try {
  if (!serverConfig().merchant?.transaction_checkout_url)
    throw new Error(`merchant.front_end_host undefined!`)
} catch (error) {
  mainLogger(`FatalErr- server config error!`, { error }, `error`)
  throw new Error(`[ServerConfig: FATAL ERROR]: config error, check log!`)
}

serverConfig().env === `TEST` && (serverConfig().env = `DEVELOPMENT`)
