import { modelFactory } from "@turnkeyid/utils-ts"

export class CryptoDetail {
  constructor(
    public force_currency?: string, 
    public icon?: string,
    public requirement?: {
      minimum_amount?: {
        idr?: number
        usd?: number
      }
      maximum_amount?: {
        idr?: number
        usd?: number
      }
    }
  ) {}
  
    static factory = modelFactory(CryptoDetail)
}
