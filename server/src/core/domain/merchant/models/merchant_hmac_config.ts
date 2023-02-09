import { modelFactory } from "@turnkeyid/utils-ts"

export class MerchantHmacConfig {
  constructor(
    public merchant_id: string,
    public merchant_hmac_secret_key: string,
    public environment: string,
  ) {}

  static factory = modelFactory(MerchantHmacConfig)
}
