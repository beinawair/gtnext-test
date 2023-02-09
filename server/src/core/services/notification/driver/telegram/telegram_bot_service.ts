
import { mainLogger } from '@server/core/logger/gtnext_logger'
import { Telegraf as TelegramBot } from 'telegraf'
import type { SendMessageRequest } from '../models/send_message_request'
import { BotResponse } from './models/bot_response'

process.env.NTBA_FIX_319 = <any>1

export type TelegramBotSetting = {
  token: string;
  chatID: string | number;
}

export class TelegramBotService {
  private _client!: TelegramBot
  private _isConnected = false
  private _setting!: TelegramBotSetting
	
  private readonly _isReady = async () => {
    !this._isConnected && (() => {
      throw new Error(`not ready`)
    })()
  }
	
  async connect(setting: TelegramBotSetting) {
    this._client = new TelegramBot(setting.token)
    this._setting = setting
    this._isConnected = true
  }
	
  async sendMessage(request: SendMessageRequest): Promise<BotResponse> {
    try {
      await this._isReady()
      const resp = await this._client.telegram.sendMessage(
        request.to?.id ?? this._setting.chatID,
        request.content,
        {
          parse_mode: `HTML`,
        })
      return new BotResponse(
        resp.message_id,
        resp.chat,
        resp.from,
        resp.text,
        resp.reply_to_message,
        resp.date,
      )
    } catch (error) {
      mainLogger(`Telegram:sendMessage:Err`, { error }, `error`)
      throw error			
    }
  }
	
  // Async addListener<T>(command,todo: (ctx)=>T) {
  // 	!this._isConnected && (function(){throw `not connected`})
		
  // 	this._client.command(command, (ctx) => {
  // 		this._logger("app_logger",`${command} command requested ...`, { by: ctx.from })
  // 		todo(
  // 			new ResponseBotContext(
  // 				this,
  // 				TelegramBotContextMapper(ctx),
  // 			),
  // 		)
  // 	})
  // }
	
  // async startListeners() {
  // 	const server = this._serverWebhook
  // 	const serverIp = await server?.ip
		
  // 	const launchOpts: TelegramBot.LaunchOptions | undefined =
  // 		(server?.domain || server?.port || server?.ip) ? {
  // 			webhook: {
  // 				domain: server.domain,
  // 				host: !server.domain ? serverIp : undefined,
  // 				hookPath: `/socket`,
  // 				port: (server.port && (server.domain || server.ip)) ?
  // 					Number(server.port) :
  // 					undefined,
  // 			},
  // 		} : undefined
			
  // 	this._logger("app_logger",`start bot hook / webhook`,{ launchOpts,server })
  // 	await this._client.launch((launchOpts && server?.webhookOn) ? launchOpts : {})
  // }
	
  async stopAllListeners(code = `SIGINT`) {
    this._client.stop(code)
  }
	
  protected custom() {
    return this._client
  }
}
