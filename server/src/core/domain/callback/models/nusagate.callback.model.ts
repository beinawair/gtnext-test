import { modelFactory } from "@turnkeyid/utils-ts"

export class NusagateInvoiceCallback {
  constructor(
    public slug: string,
    public email: string,
    public price: number,
    public paidAt: string,
    public status: string,
    public dueDate: string,
    public externalId: any,
    public completedAt: string,
    public description: string,
    public payCurrency: string,
    public paymentLink: string,
    public phoneNumber: string,
    public baseCurrency: string,
  ) {}

  static Factory = modelFactory(NusagateInvoiceCallback)
}

export class NusagateTransferCallback {
  constructor(
    public id: string,
    public externalId: string,
    public slug: string,
    public status: string,
    public amount: number,
    public fee: number,
    public receivedAmount: number,
    public confirmedAt: string,
    public currencyCode: string,
    public paymentType: string,
  ) {}

  static Factory = modelFactory(NusagateTransferCallback)
}
