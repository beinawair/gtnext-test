import { modelFactory } from '@turnkeyid/utils-ts'

export class VirtualAccountInvoice {
  constructor(
    public id: string,
    public transaction_id: string,
    public gateway_response: Record<any, any>,
    public request_amount: number,
    public admin_fee: number,
    public pay_amount: number,
    public tax: number,
    public bank_name: string,
    public bank_account: string,
  ) {}

  static factory = modelFactory(VirtualAccountInvoice, { autoGeneratedProp: [`id`] })
}
