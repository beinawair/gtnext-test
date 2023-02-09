import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { RequestContext } from "@server/core/models/request_context"
import { BaseNotificationService } from "./base_notification_service"

export const GateCashNotificationService = async (_context: RequestContext) => {
  try {
    const client = await BaseNotificationService(_context)
    client.setPrependMessage((formatId, render) => `🔔Payment🔔`)
    client.setAppendMessage(() => `Env: ${ process.env.NODE_ENV } \n please check dashboard / payment gateway dashboard`)

    return client
  } catch (error) {
    mainLogger(`NotificationService:FatalErr`, { error }, `error`)
    throw error
  }
}
