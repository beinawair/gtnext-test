import type { MerchantTransaction } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import type { PaymentMethod, TypeOfPaymentMethodType } from "@server/core/domain/payment_method/models/payment_method"
import { isEmpty, modelFactory, createStringUnionType } from "@turnkeyid/utils-ts"

export const InvoiceStatus = [`UNPAID`, `PROCESSING`, `FAILED`, `PAID`, `CANCELED`, `ARCHIVED`, `DELETED`] as const
export type TypeOfInvoiceStatus = typeof InvoiceStatus[number]
export const { getValidValue: getInvoiceStatus } = createStringUnionType(InvoiceStatus)

export class Invoice<
  InvoiceDetails extends InvoiceVADetails | InvoiceCryptoDetails | Record<any, any> = Record<any, any>,
> {
  constructor(
    public id: string,
    public selected_payment_method: PaymentMethod,
    public status: TypeOfInvoiceStatus,
    public request_amount: number,
    public admin_fee: number,
    public pay_amount: number,
    public currency: "IDR" | "USD",
    public transaction_id: string,
    public transaction?: MerchantTransaction,
    public payment_link?: string,
    public details?: InvoiceDetails,
    public debug?: Record<any, any>,
  ) {}

  static factory = modelFactory(Invoice)

  static getValidRelation = (payment: Invoice): Invoice & {
    transaction: MerchantTransaction;
  } => {
    if (isEmpty(payment.transaction))
      throw new Error(`payment.transaction empty!`)
    return {
      ...payment,
      transaction: payment.transaction,
    }
  }
}

export class InvoiceVADetails {
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
}

export class InvoiceCryptoDetails {
  constructor(
    public id: string,
    public slug: string,
    public type: string,
    public externalId: string,
    public description: string,
    public dueDate: string,
    public email: string,
    public phoneNumber: string,
    public paymentType: string,
    public fee: number,
    public createdAt: string,
    public updatedAt: string,
    public status: string,
    public merchant: {
      id: string;
      name: string;
    },
    public price: number,
    public paymentLink: string,
    public baseCurrency: string,
    public expiredAmountAt?: any,
    public paidAt?: any,
    public completedAt?: any,
    public details?: any,
    public amount?: any,
    public paymentAddress?: any,
    public payCurrency?: any,
  ) {}
}

export class NewInvoiceRequest {
  constructor(
    public transaction_id: string,
    public selected_payment_method: {
      id: string;
      gateway_id: string;
      type: TypeOfPaymentMethodType;
    },
    public currency?: "IDR" | "USD",
    public request_amount?: number,
    public pay_amount?: number,
    public admin_fee?: number,
    public status?: TypeOfInvoiceStatus,
  ) {}
}
