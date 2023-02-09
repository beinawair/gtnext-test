import { modelFactory } from "@turnkeyid/utils-ts"

export class LinkQuCallback {
  constructor(
    public amount: number,
    public response_code: string,
    public response_desc: string,
    public serialnumber: string,
    public type: string,
    public payment_reff: number,
    public va_code: string,
    public partner_reff: string,
    public partner_reff2: string,
    public additionalfee: number,
    public balance: number,
    public credit_balance: number,
    public transaction_time: string,
    public va_number: string,
    public customer_name: string,
    public username: string,
    public status: string,
  ) {}

  static Factory = modelFactory(LinkQuCallback)
}
