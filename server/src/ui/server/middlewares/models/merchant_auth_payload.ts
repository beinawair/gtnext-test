import { BaseAuth } from "./base_auth_payload"

export class MerchantAuth extends BaseAuth {
  constructor(
    public merchant_id: string,
    public exp_date: Date,
  ) {
    super()
  }
}
