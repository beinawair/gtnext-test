import { mainLogger } from "@server/core/logger/gtnext_logger"
import type { RequestContext } from "@server/core/models/request_context"
import { GateCashNotificationService } from "@server/core/services/notification/gate_cash_notification_service"
import { getCurrencyAmountString, getDateOffset, getFormattedDate, Result_ } from "@turnkeyid/utils-ts"
import type { Invoice } from "../../invoice/models/invoice.model"

export const MerchantNotification = async (_context: RequestContext) => {
  const notifSvc = await GateCashNotificationService(_context)
    .catch(error => {
      mainLogger(`NotifService:FailedInit`, { error }, `error`)
    })

  const readableExpiredTime = (datetime: number) => getFormattedDate(getDateOffset(datetime * 1000, 7, `h`).toDate())
  
  const sendCreatePaymentNotif = async (payment: Invoice) => {
    try {
      if (!notifSvc?.sendNotif)
        throw new Error(`notifSvc not initialized`)

      if (!payment.pay_amount)
        throw new Error(`payment.pay_amount empty`)

      await notifSvc.sendNotif({
        formatId: `CREATE_PAYMENT`,
        data: {
          payment,
          readable_amount: getCurrencyAmountString(payment.pay_amount, `IDR`),
          readable_expired_time: readableExpiredTime(payment.transaction?.expired_datetime ?? 0),
        },
        title: `Create payment`,
      })
      return Result_.ok(void 0)
    } catch (error) {
      return Result_.err(`[MerchantNotif:sendCreatePayment:Err]: ${ error.message }`)
    }
  }

  const sendPaymentSuccessNotif = async (payment: Invoice) => {
    try {
      if (!notifSvc?.sendNotif)
        throw new Error(`notifSvc not initialized`)

      if (!payment.pay_amount)
        throw new Error(`payment.pay_amount empty`)

      await notifSvc.sendNotif({
        formatId: `SUCCESS_PAYMENT`,
        data: {
          payment,
          readable_amount: getCurrencyAmountString(payment.pay_amount, `IDR`),
          readable_expired_time: readableExpiredTime(payment.transaction?.expired_datetime ?? 0),
        },
        title: `Success payment`,
      })
      return Result_.ok(void 0)
    } catch (error) {
      return Result_.err(`[MerchantNotif:sendSuccessPayment:Err]: ${ error.message }`)
    }
  }

  return {
    sendCreatePaymentNotif,
    sendPaymentSuccessNotif,
  }
}
