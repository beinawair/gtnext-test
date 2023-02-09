import { isEmpty, modelFactory } from "@turnkeyid/utils-ts/web"
import { Transaction } from "./checkout_transaction"
import { PaymentMethod } from "./payment_method"

export class Invoice {
  constructor(
    public id: string,
    public selected_payment_method: PaymentMethod,
    public status: string,
    public request_amount: number,
    public admin_fee: number,
    public pay_amount: number,
    public currency: "IDR" | "USD",
    public transaction_id: string,
    public transaction?: Transaction,
    public payment_link?: string,
    public details?: Record<any, any>,
    public debug?: Record<any, any>
  ) {}

  static factory = modelFactory(Invoice)

  static getValidRelation = (
    payment: Invoice
  ): Invoice & {
    transaction: Transaction
  } => {
    if (isEmpty(payment.transaction))
      throw new Error(`payment.transaction empty!`)
    return {
      ...payment,
      transaction: payment.transaction,
    }
  }
}
export type InvoiceVA = Invoice & {
  details: {
    time: number
    amount: number
    expired: string
    bank_code: string
    bank_name: string
    customer_phone: string
    customer_id: string
    customer_name: string
    customer_email: string
    partner_reff: string
    username: string
    pin: string
    status: string
    response_code: string
    response_desc: string
    virtual_account: string
    partner_reff2: string
  }
}

export type InvoiceCrypto = Invoice & {
  data: {
    id: string
    slug: string
    type: string
    externalId: string
    description: string
    dueDate: string
    expiredAmountAt?: any
    email: string
    phoneNumber: string
    payCurrency?: any
    paymentLink: string
    baseCurrency: string
    price: number
    amount?: any
    paymentType: string
    fee: number
    paidAt?: any
    completedAt?: any
    details?: any
    createdAt: string
    updatedAt: string
    status: string
    merchant: {
      id: string
      name: string
    }
    paymentAddress?: any
  }
  meta: {
    message: string
    statusCode: number
  }
}
