import { mapToMany, mapToOne, Result_, nonNullValue } from "@commons"
import type { Result } from "@commons"
import { Transaction } from "@models/checkout_transaction"
import { PaymentVirtualBank } from "@models/payment"
import { PaymentMethod } from "@models/payment_method"
import { Invoice } from "@models/invoice"
import { AxiosHttpClientWeb } from "@gateways/utils/http_client_web/axios_http_client"

export type StandardAPIResponse = {
  code: number
  data: any
  httpStatus: number
  message: string
  status: string
  error?: any
}
export type AxiosResponse = {
  data: StandardAPIResponse
}

export const GateCashSecureAPI = (request: { transaction_token: string }) => {
  const { transaction_token } = request
  const httpClient = AxiosHttpClientWeb()
  httpClient.setOptions({
    url: `${nonNullValue(process.env.NEXT_PUBLIC_API_HOST)}`,
    headers: {
      Authorization: `Bearer ${transaction_token}`,
    },
  })

  const fetchPaymentMethods = async (): Promise<Result<PaymentMethod[]>> =>
    httpClient
      .get(`/v1/payment-method`)
      .then((result: StandardAPIResponse) =>
        mapToMany(PaymentMethod.factory, result.data)
      )
      .catch((error) => Result_.err(error))
  const getTransactionByToken = async (request?: { token?: string }) =>
    httpClient
      .get(
        `/v1/transaction/get`,
        void 0,
        request?.token
          ? {
              headers: `Bearer ${request.token} `,
            }
          : void 0
      )
      .then((result: StandardAPIResponse) => {
        const transaction = Transaction.factory(result.data)
        return Result_.ok(transaction)
      })
      .catch((error) => Result_.err(error))

  const createPayment = async (request: {
    payment_method: PaymentMethod
    transaction_id: string
  }): Promise<Result<PaymentVirtualBank>> =>
    httpClient
      .post(`/v1/payment/${request.transaction_id}/create-payment`, {
        ...request,
      })
      .then((result: StandardAPIResponse) =>
        mapToOne(PaymentVirtualBank.factory, result.data)
      )
      .catch((error) => Result_.err(error))

  const checkPaymentStatus = async (request: {
    transaction_id: string
  }): Promise<Result<Transaction>> =>
    httpClient
      .post(`/v1/payment/${request.transaction_id}/status`, {
        ...request,
      })
      .then((result: StandardAPIResponse) => {
        if (result.status !== `SUCCESS`)
          return Result_.err(`Payment not completed!`)

        return Result_.ok(result.data)
      })
      .catch((error) => Result_.err(error))

  const createCryptoInvoice = async (
    transaction: Transaction,
    selectedPaymentMethod: PaymentMethod | undefined
  ) => {
    const requestPayload = {
      payment_method: {
        ...selectedPaymentMethod,
        gateway_id: `NUSAGATE`,
        type: `CRYPTO`,
      },
      currency: `USD`,
    }

    return httpClient
      .post(`/v1/transaction/${transaction?.id}/create-invoice`, {
        ...requestPayload,
      })
      .then((result: StandardAPIResponse) => {
        if (result.status !== `SUCCESS`)
          return Result_.err(`Payment not completed!`)

        return Result_.ok(result.data as Invoice)
      })
      .catch((error) => Result_.err(error))
  }
  
  const createCryptoManualInvoice = async (
    transaction: Transaction,
    selectedPaymentMethod: PaymentMethod | undefined
  ) => {
    const requestPayload = {
      payment_method: {
        ...selectedPaymentMethod,
        gateway_id: `MANUAL`,
        type: `CRYPTO`,
      },
      currency: `USD`,
    }

    return httpClient
      .post(`/v1/transaction/${transaction?.id}/create-invoice`, {
        ...requestPayload,
      })
      .then((result: StandardAPIResponse) => {
        if (result.status !== `SUCCESS`)
          return Result_.err(`Payment not completed!`)

        return Result_.ok(result.data as Invoice)
      })
      .catch((error) => Result_.err(error))
  }

  const createVirtualAccountInvoice = async (
    transaction: Transaction,
    selectedPaymentMethod: PaymentMethod | undefined
  ) => {
    const requestPayload = {
      payment_method: {
        ...selectedPaymentMethod,
        gateway_id: `LINKQU`,
        type: `VA`,
      },
      currency: `IDR`,
    }

    return httpClient
      .post(`/v1/transaction/${transaction?.id}/create-invoice`, {
        ...requestPayload,
      })
      .then((result: StandardAPIResponse) => {
        if (result.status !== `SUCCESS`)
          return Result_.err(`Payment not completed!`)

        return Result_.ok(result.data as Invoice)
      })
      .catch((error) => Result_.err(error))
  }

  return {
    fetchPaymentMethods,
    getTransactionByToken,
    checkPaymentStatus,

    createPayment,

    createCryptoInvoice,
    createCryptoManualInvoice,
    createVirtualAccountInvoice,
  }
}
