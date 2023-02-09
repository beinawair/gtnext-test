import { modelFactory } from "@turnkeyid/utils-ts"

export class DirectBankDetail {
  constructor(
    public id: string,
    public bank_name: string,
    public account_number: string,
    public account_name: string,
  ) {}

  static factory = modelFactory(DirectBankDetail)
}
