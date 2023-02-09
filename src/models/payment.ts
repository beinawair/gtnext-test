import { modelFactory } from "@commons"

export class PaymentVirtualBank {
  constructor(
    public transaction_id: string,
    public gateway_response: Record<any, any>,
    public admin_fee: number,
    public pay_amount: number,
    public tax: number,
    public bank_name: string,
    public bank_account: string
  ) {}

  getGatewayResponse = <
    F extends new (...arguments_: any[]) => D,
    D extends object
  >(
    factory: F
  ): D => {
    const expectedResponse = modelFactory(factory)
    return expectedResponse(Object.assign(this.gateway_response))
  }

  static factory = modelFactory(PaymentVirtualBank)
}
