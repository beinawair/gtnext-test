import Mustache from 'mustache'
import type { RequestContext } from '@server/core/models/request_context'
import type { NotificationConfig } from './config/notification_config'
import { getNotifConfigById } from './config/notification_config'
import { TelegramNotificationDriver } from './driver/telegram/telegram_notification_driver'
import type { SendNotifRequest } from './models/send_notif_request'
import { DefaultMessageFormat } from './config/default_message_format'
import type { Result } from '@turnkeyid/utils-ts'
import { DeepObjectPlainMerge, nonNullValue, omitKeyProperty, Result_ } from '@turnkeyid/utils-ts'
import { mainLogger } from '@server/core/logger/gtnext_logger'

export const BaseNotificationService = async (_context: RequestContext, configOverride?: Partial<NotificationConfig>) => {
  const _driver = new TelegramNotificationDriver()
  const _getDriverConfig = (config: NotificationConfig) => config.driver_config[_driver.driver_type]

  const _getConfig = async () => {
    const { merchant_id } = nonNullValue(_context, true)
    const config = await getNotifConfigById(merchant_id).catch(error => void 0)
		
    if (!config?.driver_config)
      throw new Error(`[notification] config not found`)
			
    if (
      typeof _getDriverConfig(config).chatID !== `string` 
			|| typeof _getDriverConfig(config).token !== `string`
    ) 
      throw new Error(`[notification] config malformed`)
		
    return config
  }

  const _config: NotificationConfig = DeepObjectPlainMerge(await _getConfig(), (configOverride as NotificationConfig))
  
  const _driverConfig = _getDriverConfig(_config)

  // Starting up driver
  await _driver.connect({ chatID: _driverConfig.chatID, token: _driverConfig.token })

  let _prependMessageFunctor: ((formatId, mustacheRender) => string | Promise<string>) | undefined = void 0
  const setPrependMessage = (functor: typeof _prependMessageFunctor) => {
    _prependMessageFunctor = functor
  }

  let _appendMessageFunctor: ((formatId, mustacheRender) => string | Promise<string>) | undefined = void 0
  const setAppendMessage = (functor: typeof _appendMessageFunctor) => {
    _appendMessageFunctor = functor
  }

  const _getMessageFormatRecursive = async (
    variable: Record<string, any>,
    formatId = `GENERAL`,
    customTemplate?: string,
    deep = 3,
  ) => {
    try {
      const templateFormat = customTemplate
        ?? _config?.message_format[formatId]
        ?? _config?.message_format[`DEFAULT`]
        ?? DefaultMessageFormat
      
      // Ignoring disabled message for certain config
      if (templateFormat.includes(`<<DISABLED>>`))
        throw new Error(`[Notification:Disabled]: formatId: ${ formatId }, message disabled.`)
      
      typeof variable === `object` && Object.keys(variable).forEach(
        key => {
        // Detect opening from text template 
          if (typeof variable[key] === `string` && variable[key].includes(`{{`)) {
            variable[key] = _getMessageFormatRecursive(
              omitKeyProperty(variable, key),
              formatId,
              variable[key],
              deep - 1,
            )
          }
        },
      )
      let formattedText = Mustache.render(templateFormat, variable)
      
      // Handle Before message
      typeof _config.message_format[`__PRE_TEMPLATE`] === `string`
        ? (formattedText = `${ Mustache.render(_config.message_format[`__PRE_TEMPLATE`], variable) } \n ${ formattedText }`)
        : void 0
      typeof _prependMessageFunctor === `function`
        ? (formattedText = `${ _prependMessageFunctor(formatId, Mustache.render) } \n ${ formattedText }`)
        : void 0
      // Handle After message
      typeof _config.message_format[`__END_TEMPLATE`] === `string`
        ? (formattedText = `${ formattedText } \n ${ Mustache.render(_config.message_format[`__END_TEMPLATE`], variable) }`)
        : void 0
      typeof _appendMessageFunctor === `function`
        ? (formattedText = `${ formattedText } \n ${ _appendMessageFunctor(formatId, Mustache.render) }`)
        : void 0
      
      return formattedText
    } catch (error) {
      mainLogger(`Notification:_getMessageFormat:Err`, { error }, `error`)
      return ``
    }
  }

  const sendNotif = async (request: SendNotifRequest): Promise<Result<unknown>> => {
    try {
      const content = await _getMessageFormatRecursive(
        {
          title: request.title,
          ...request.data,
        },
        request.formatId,
        request.template,
      )
      return Result_.ok(
        await _driver.send({
          content,
        }),
      )
    } catch (error) {
      mainLogger(`Notification:SendNotif:Err`, { error }, `error`)
      return Result_.err(error)
    }
  }

  return { sendNotif, setPrependMessage, setAppendMessage }
}
