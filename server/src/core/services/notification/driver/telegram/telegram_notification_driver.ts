import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { NotificationDriverSetting } from "../models/notification_driver_setting"
import type { SendMessageRequest } from "../models/send_message_request"
import type { NotificationDriverPort } from "../notification_driver.port"
import { TelegramBotService } from "./telegram_bot_service"

export class TelegramNotificationDriver
implements NotificationDriverPort {
  driver_type = `TELEGRAM`
	
  constructor(
    private readonly _client = new TelegramBotService(),
  ) {}
	
  async connect(setting: NotificationDriverSetting): Promise<void> {
    try {
      await this._client.connect(setting)
    } catch (error) {
      mainLogger(`Telegram:connect:Err`, { error }, `error`)
      throw error
    }
  }
	
  async send(request: SendMessageRequest): Promise<unknown> {
    try {
      return await this._client.sendMessage(request)
    } catch (error) {
      mainLogger(`Telegram:send:Err`, { error }, `error`)
      throw error
    }
  }
}
