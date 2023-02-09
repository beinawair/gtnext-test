import { modelFactory } from "@turnkeyid/utils-ts"
import type { PaymentMethod } from "../../payment_method/models/payment_method"

export class CreateInvoiceRequest {
  constructor(
    public amount: number,
    public customer_id: string,
    public customer_name: string,

    /** @description expired should in EPOCH, not MS and in UTC! */
    public expired: number,
    public customer_phone: string,
    public customer_email: string,
    public payment_method: PaymentMethod,
  ) {}

  static factory = modelFactory(CreateInvoiceRequest)
}
