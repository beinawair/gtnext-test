import { createStringUnionType, modelFactory } from '@turnkeyid/utils-ts'
import type { Item, OrderDetail } from './order_detail'
import type { UserDetail } from './user_detail'

export const MerchantPaymentStatus = [`SUCCESS`, `PENDING`, `GATEWAY_REQUESTED`, `FAILED`, `CANCELED`, `EXPIRED`] as const
export const { getValidValue: getMerchantPaymentStatusOption, optionType } = createStringUnionType(MerchantPaymentStatus)
export type MerchantPaymentStatusType = typeof optionType

export type MerchantTransactionCallback = {
  url: string;
  status: MerchantPaymentStatusType;
  data?: Record<any, any>;
  histories?: string[];
}

export class MerchantTransaction {
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
      success?: string;
      error?: string;
    },
  ) {}

  static factory = modelFactory(MerchantTransaction, {})

  static isValidStatus = getMerchantPaymentStatusOption
}

export class MerchantTransactionRequest {
  constructor(
    public user_detail: UserDetail,

    public order_detail: {
      items: Item[],
      base_currency: 'IDR' | 'USD',
      alt_currency: 'IDR' | 'USD',
      currency_rate?: number,
      tax_percentage?: number,
    },

    /** @description in EPOCH seconds! */
    public expired_datetime: number,

    public callback?: MerchantTransactionCallback,

    public redirect_url?: {
      success?: string;
      error?: string;
    },

    public iframe?: boolean,
  ) {}

  static factory = modelFactory(MerchantTransactionRequest)
}

export class MerchantTransactionExpose
  extends MerchantTransaction {}
