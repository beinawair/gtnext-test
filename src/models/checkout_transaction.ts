import { createStringUnionType, modelFactory } from "@commons"

export const MerchantPaymentStatus = [
  `SUCCESS`,
  `PENDING`,
  `GATEWAY_REQUESTED`,
  `FAILED`,
  `CANCELED`,
  `EXPIRED`,
] as const
export const { getValidValue: getMerchantPaymentStatusOption, optionType } =
  createStringUnionType(MerchantPaymentStatus)
export type MerchantPaymentStatusType = typeof optionType

export class Item {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public qty: number,
    public cost_base: number,
    public cost_alt: number,
    public tax: number,
    public currency_rate?: number
  ) {}
}

export class OrderDetail {
  constructor(
    public id: string,
    public items: Item[],
    public total: {
      qty: number
      cost_base: number
      cost_alt: number
    },
    public currency_rate?: number,
    public base_currency?: number,
    public alt_currency?: number,
    public tax_percentage?: number
  ) {}
}

export class UserDetail {
  constructor(
    public name: string,
    public email: string,
    public phone: string,
    public address: string
  ) {}
}

export type MerchantTransactionCallback = {
  url: string
  data?: Record<any, any>
  histories?: string[]
}

export class TransactionRequest {
  constructor(
    public user_detail: UserDetail,

    public items: Item[],

    /** @description in EPOCH seconds! */
    public expired_datetime: number,

    public callback?: MerchantTransactionCallback,

    public redirect_url?: {
      success?: string
      error?: string
    }
  ) {}

  static factory = modelFactory(TransactionRequest)
}

export class Transaction {
  constructor(
    public id: string,

    public transaction_url: string,
    public merchant_id: string,

    public user_detail: UserDetail,

    public order_detail: OrderDetail,

    /** @description in EPOCH seconds! */
    public expired_datetime: number,

    public status: MerchantPaymentStatusType,

    public callback?: MerchantTransactionCallback,

    public redirect_url?: {
      success?: string
      error?: string
    }
  ) {}

  static factory = modelFactory(Transaction)
}
