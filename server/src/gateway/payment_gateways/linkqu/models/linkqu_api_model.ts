import { modelFactory } from "@turnkeyid/utils-ts"

export class LinkQuCreatePaymentRequest {
  constructor(
    public amount: number,
    public customer_id: string,
    public customer_name: string,

    /** @description expired should in EPOCH, not MS and in UTC! */
    public expired: string,
    public customer_phone: string,
    public customer_email: string,
    public bank_code: string,

    public username: string,
    public pin: string,
    public partner_reff: string,
  ) {}

  static factory = modelFactory(LinkQuCreatePaymentRequest)
}

export class LinkQuCreatePaymentResponse {
  constructor(
    public time: number,
    public amount: number,
    public expired: string,
    public bank_code: string,
    public bank_name: string,
    public customer_phone: string,
    public customer_id: string,
    public customer_name: string,
    public customer_email: string,
    public partner_reff: string,
    public username: string,
    public pin: string,
    public status: string,
    public response_code: string,
    public response_desc: string,
    public virtual_account: string,
    public partner_reff2: string,
  ) {}

  static factory = modelFactory(LinkQuCreatePaymentResponse)
}

export class LinkQuCheckStatusResponse {
  constructor(
    public rc: string,
    public rd: string,
    public total: number,
    public balance: number,
    public lastUpdate: string,
    public inquiry_reff: number,
    public payment_reff: number,
    public partner_reff: string,
    public reference: string,
    public id_produk: string,
    public nama_produk: string,
    public grup_produk: string,
    public debitted: number,
    public amount: number,
    public amountfee: number,
    public info1: string,
    public info2: string,
    public info3: string,
    public info4: string,
    public status_trx: string,
    public status_desc: string,
    public status_paid: string,
    public tips_qris: number,
  ) {}

  static factory = modelFactory(LinkQuCheckStatusResponse)
}
