import { isObjectOnlyType } from "@turnkeyid/utils-ts"
import type { DirectBankDetail } from "../models/direct_bank_detail"
import type { PaymentMethod } from "../models/payment_method"
import type { VirtualAccountDetail } from "../models/virtual_account_detail"

export const getPaymentMethodDetail = (
  pm: PaymentMethod,
) => {
  const isVA = (detail: unknown): detail is VirtualAccountDetail => (!!detail && isObjectOnlyType<VirtualAccountDetail>(detail) && pm.type === `VA`)
  const isDirectBank = (detail: unknown): detail is DirectBankDetail => (!!detail && isObjectOnlyType(detail) && pm.type === `DIRECT_BANK`)

  return {
    isVA,
    getVADetail() {
      if (isVA(pm.detail))
        return pm.detail

      throw new Error(`detail not VA`)
    },
    isDirectBank,
    getDirectBankDetail() {
      if (isDirectBank(pm.detail))
        return pm.detail

      throw new Error(`detail not DIRECT_BANK`)
    },
  }
}
