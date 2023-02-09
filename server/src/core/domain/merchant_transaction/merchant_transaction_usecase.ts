import type { RequestContext } from "@server/core/models/request_context"
import type { MerchantTransactionRequest } from "./models/merchant_transaction"
import { MerchantTransactionExpose, MerchantTransaction } from "./models/merchant_transaction"
import { serverConfig } from "@server/core/config/server_config"
import { TransactionTokenPayload } from "./models/transaction_token"
import type { DeepPartial, Result } from "@turnkeyid/utils-ts"
import { toNumberOrUndefined, generateUUID, sumNumbers, generateObjectIDString, isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { MerchantTransactionDTOUtil } from "@server/gateway/database/mikro-orm/dtos/merchant_transaction_dto.util"
import { SecureJWT } from "@turnkeyid/utils-ts/utils"
import { OrderDetail } from "./models/order_detail"

/**
 * This usecase work as controller too,
 * with functional programming pattern
 * @param _context
 * @returns
 */
export const MerchantTransactionUsecase = async (_context: RequestContext) => {
  const { merchant_id } = _context

  // >>> Initialize dependencies
  const [
    merchantRepo,
  ] = await Promise.all([
    MerchantTransactionDTOUtil(_context),
  ])
  // <<< END

  const _isValidTransactionRequest = (request_: MerchantTransactionRequest) => {
    const {
      expired_datetime,
      order_detail,
      iframe,
      user_detail,
      callback,
      redirect_url,
    } = request_

    if (expired_datetime <= Date.now() / 1000)
      return Result_.err(`invalid expired_datetime, must be newer!`)

    if (isEmpty(user_detail.email) || isEmpty(user_detail.name))
      return Result_.err(`user_detail invalid! check user input!`)

    // const total = items.reduce(
    //   (total, current) => {
    //     total.qty += toNumberOrUndefined(current.qty) ?? 0
    //     total.cost_base += toNumberOrUndefined(current.cost_base) ?? 0

    //     // do validate here too

    //     return total
    //   },
    //   {} as {
    //     qty: number;
    //     cost_base: number;
    //   },
    // )
    const total: OrderDetail['total'] = {
      cost_base: sumNumbers(order_detail.items.map(item => item.cost_base)),
      cost_alt: sumNumbers(order_detail.items.map(item => item.cost_alt)),
      qty: sumNumbers(order_detail.items.map(item => item.qty)),
    }
    if (total.cost_base < 10_000 && total.cost_base > 2_000_000_000)
      return Result_.err(`invalid item(s) cost, should between IDR 10.000 and IDR 2.000.000.000`)

    try {
      if (callback && !redirect_url?.success)
        return Result_.err(`callback_json exist, but success_redirect_url not exist!`)
    } catch {
      return Result_.err(`callback_json not parsable!`)
    }

    return Result_.ok(true)
  }

  /**
   * First request attempt from merchant
   * to order pay a item(s)
   * @param _request
   */
  const createTransaction = async (
    _request: MerchantTransactionRequest,
  ): Promise<Result<MerchantTransactionExpose>> => {
    //
    const isValidRequestResult = _isValidTransactionRequest(_request)
    if (!isValidRequestResult.isOk)
      return isValidRequestResult

    const {
      expired_datetime,
      order_detail,
      user_detail,
      callback,
      redirect_url,
      iframe,
    } = _request

    const transaction = MerchantTransaction.factory({
      id: generateObjectIDString(),
      order_detail: {
        ...order_detail,
        id: generateUUID(),
        items: order_detail.items,
        total: {
          cost_base: sumNumbers(order_detail.items.map(item => item.cost_base)),
          cost_alt: sumNumbers(order_detail.items.map(item => item.cost_alt)),
          qty: sumNumbers(order_detail.items.map(item => item.qty)),
        },
        tax_percentage: order_detail.tax_percentage ?? 0,
      },
      user_detail,
      expired_datetime,
      merchant_id,
      status: `PENDING`,
      transaction_url: ``,
      callback,
      redirect_url,
    })

    const provideTransactionUrl = async (transaction: MerchantTransaction, options?: {
      iframe?: boolean;
    }) => {
      const { iframe } = options ?? {}
      const checkoutUrl = `${ serverConfig().merchant.transaction_checkout_url }`

      const urlParameters = new URLSearchParams()
      const {
        // Takeout all unused property
        callback,
        ...input
      } = transaction

      // Generate access token for frontend
      const secureClient = SecureJWT()
      const expiredRemainMS = Math.floor(transaction.expired_datetime - (Date.now() / 1000))
      const tokenPayload = TransactionTokenPayload.factory({
        merchant_id,
        transaction_id: transaction.id,
        allow_origin: `*.gate-cash.com`,
        expired: transaction.expired_datetime * 1e3,
      })

      const token = secureClient.encryptPayload(tokenPayload, {
        expiresIn: expiredRemainMS,
        exposeData: {},
      })

      urlParameters.append(`token`, token)

      callback?.url
        ? urlParameters.append(`callback_url`, callback?.url)
        : void 0

      transaction.transaction_url = `${ checkoutUrl }?${ urlParameters.toString() }${ iframe ? `&iframe=true` : `` }`
    }

    await provideTransactionUrl(transaction, { iframe })
    const addTransactionResult = await merchantRepo.addTransaction(transaction)
    if (!addTransactionResult.isOk)
      return addTransactionResult

    return Result_.ok(
      MerchantTransactionExpose.factory({
        ...transaction,
      }),
    )
  }

  /**
   * Update single transaction
   * @param transaction_id
   * @param patch
   * @returns
   */
  const updateTransaction = async (transaction_id: string, patch: DeepPartial<MerchantTransaction>): Promise<Result<MerchantTransaction>> => {
    const existTransaction = await merchantRepo.getTransaction({ id: transaction_id })
    if (!existTransaction.isOk)
      return Result_.err(`transaction not found`)
    const updatedTransaction = await merchantRepo.updateTransaction({ id: transaction_id }, patch)
    if (!updatedTransaction.isOk)
      return Result_.err(`updated transaction not found`)
    
    return updatedTransaction
  }

  const getTransactionByID = async (transaction_id: string) => merchantRepo.getTransaction({
    id: transaction_id,
  })

  return { createTransaction, updateTransaction, getTransactionByID }
}
