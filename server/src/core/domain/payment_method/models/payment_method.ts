import { createStringUnionType, modelFactory } from '@turnkeyid/utils-ts'
import type { CryptoDetail } from './crypto_detail'
import type { DirectBankDetail } from './direct_bank_detail'

import type { VirtualAccountDetail } from "./virtual_account_detail"

export const PaymentMethodStatus = [`OK`, `CLOSED`, `MAINTENANCE`, `ARCHIVED`] as const
export type TypeOfPaymentMethodStatus = typeof PaymentMethodStatus[number]
export const { getValidValue: getPaymentMethodStatusOption } = createStringUnionType(PaymentMethodStatus)
export const PaymentMethodType = [`VA`, `DIRECT_BANK`, `CRYPTO`] as const
export type TypeOfPaymentMethodType = typeof PaymentMethodType[number]
export const { getValidValue: getPaymentMethodTypeOption } = createStringUnionType(PaymentMethodType)

export class PaymentMethod<
  MethodDetail extends
  | VirtualAccountDetail
  | DirectBankDetail
  | CryptoDetail
  | Record<string, any> = Record<any, any>,
> {
  constructor(
    public id: string,
    public gateway_id: string,
    public type: TypeOfPaymentMethodType,
    public status: TypeOfPaymentMethodStatus,
    public readonly detail: MethodDetail,
    public requirement?: {
      minimum_amount?: {
        idr?: number;
        usd?: number;
      };
      admin_fee?: {
        idr?: number;
        usd?: number;
      };
    },
  ) {}

  static factory = modelFactory(PaymentMethod)
}
