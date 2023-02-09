import type { RequestContext } from '@server/core/models/request_context'
import { executeTest } from '@server/__tests__/common/execute_test'
import { generateUUID, getDateOffset, isEmpty, randomText, toPlainObject } from '@turnkeyid/utils-ts'
import test from 'ava'
import { MerchantTransactionUsecase } from '../merchant_transaction/merchant_transaction_usecase'
import { MerchantTransaction } from '../merchant_transaction/models/merchant_transaction'
import { PaymentMethodUsecase } from '../payment_method/payment_method_usecase'
import { InvoiceUsecase } from '../invoice/invoice_usecase'
import { getPaymentMethodDetail } from '../payment_method/utils/get_payment_method_detail'
import { MerchantTransactionDTOUtil } from '@server/gateway/database/mikro-orm/dtos/merchant_transaction_dto.util'
import { InvoiceDTOUtil } from '@server/gateway/database/mikro-orm/dtos/invoice_dto.util'

const testWrap = async (_context: RequestContext) => {
  const rollbacksPool: Array<{
    where: Record<string, any>;
    deleteMethod: (where: any) => Promise<any>;
  }> = []
  let createdTransaction: MerchantTransaction | undefined
  test.serial(`merchant_transaction - create new transaction`, async t => {
    const transactionUsecase = await MerchantTransactionUsecase(_context)
    const mockData = {
      expired_datetime: getDateOffset(Date.now(), 3, `h`).unix(),
      items: [
        {
          base_currency: `IDR`,
          alt_currency: `USD`,
          cost_base: 150_000,
          cost_alt: 10,
          description: `Buy $10 Deposit Voucher for ID A1`,
          name: `Voucher`,
          id: generateUUID(),
          base_tax: 0,
          qty: 1,
          base_tax_percentage: 0,
        } as const,
        {
          base_currency: `IDR`,
          alt_currency: `USD`,
          cost_base: 150_000,
          cost_alt: 10,
          description: `Buy $10 Deposit Voucher for ID B2`,
          name: `Voucher`,
          id: generateUUID(),
          base_tax: 0,
          qty: 1,
          base_tax_percentage: 0,
        } as const,
      ],
      user_detail: {
        address: ``,
        email: `test@gmail.com`,
        name: `TEST`,
        phone: randomText({
          length: 6,
          type: `numeric`,
        }),
      },
      callback: {
        url: `https://google.com`,
        data: { some_data: 1 },
      },
      redirect_url: { success: `https://google.com` },
    }

    const transaction = await transactionUsecase.createTransaction(mockData)

    if (!transaction.isOk)
      return t.fail(`${ transaction.error?.message }`)

    rollbacksPool.push({
      where: { id: transaction.value.id },
      deleteMethod: (await MerchantTransactionDTOUtil(_context)).deleteTransaction,
    })

    const expected = MerchantTransaction.factory({
      ...transaction.value,
      order_detail: {
        ...transaction.value.order_detail,
        items: mockData.items,
      },
      ...mockData,
    })

    t.deepEqual(transaction.value, expected)
    createdTransaction = transaction.value
  })

  test.serial(`payment_method - fetch payment methods`, async t => {
    const paymentMethodUsecase = await PaymentMethodUsecase(_context)

    const paymentMethodsResult = await paymentMethodUsecase.fetchPaymentMethods()
    t.is(isEmpty(paymentMethodsResult.value), false)
  })

  test.serial(`invoice - create invoice with va `, async t => {
    if (isEmpty(createdTransaction))
      throw new Error(`transaction empty!`)
    const paymentMethodUsecase = await PaymentMethodUsecase(_context)

    const { value: paymentMethods } = await paymentMethodUsecase.fetchPaymentMethods({ type: `VA` })
    if (isEmpty(paymentMethods))
      throw new Error(`empty payment methods - va`)

    const paymentMethod = paymentMethods.find(method =>
      method.type === `VA`
      && getPaymentMethodDetail(method).getVADetail().id === `BANK_MANDIRI`,
    )
    if (!paymentMethod)
      throw new Error(`payment method not found`)

    const invoiceUsecase = await InvoiceUsecase(_context)
    const invoiceResult = await invoiceUsecase.createInvoice({
      selected_payment_method: paymentMethod,
      transaction_id: createdTransaction.id,
      currency: `IDR`,
    })
    if (!invoiceResult.isOk)
      throw invoiceResult.error
    const { value: invoice } = invoiceResult
    rollbacksPool.push({
      where: { id: invoice.id },
      deleteMethod: (await InvoiceDTOUtil(_context)).deleteInvoice,
    })

    t.is(invoice.status, `UNPAID`)
    t.is(invoice.request_amount, 300_000)
    t.is(invoice.pay_amount, invoice.request_amount + invoice.admin_fee)
    t.is(invoice.admin_fee, 1500)
    t.is(invoice.currency, `IDR`)
    t.is(invoice.transaction_id, createdTransaction.id)
    t.is(invoice.selected_payment_method.type, `VA`)
  })

  test.serial(`invoice - create invoice with direct transfer`, async t => {
    if (isEmpty(createdTransaction))
      throw new Error(`transaction empty!`)
    const paymentMethodUsecase = await PaymentMethodUsecase(_context)

    const { value: paymentMethods } = await paymentMethodUsecase.fetchPaymentMethods({ type: `DIRECT_BANK` })
    if (isEmpty(paymentMethods))
      throw new Error(`empty payment methods - direct bank`)

    const paymentMethod = paymentMethods.find(method =>
      method.type === `DIRECT_BANK`,
    )
    if (!paymentMethod)
      throw new Error(`payment method not found`)

    const invoiceUsecase = await InvoiceUsecase(_context)
    const invoiceResult = await invoiceUsecase.createInvoice({
      selected_payment_method: paymentMethod,
      transaction_id: createdTransaction.id,
      currency: `IDR`,
    })
    if (!invoiceResult.isOk)
      throw invoiceResult.error
    const { value: invoice } = invoiceResult

    rollbacksPool.push({
      where: { id: invoice.id },
      deleteMethod: (await InvoiceDTOUtil(_context)).deleteInvoice,
    })

    t.is(invoice.status, `UNPAID`)
    t.is(invoice.request_amount, 300_000)
    t.is(invoice.pay_amount, invoice.request_amount + invoice.admin_fee)
    t.is(invoice.admin_fee, 0)
    t.is(invoice.currency, `IDR`)
    t.is(invoice.transaction_id, createdTransaction.id)
    t.is(invoice.selected_payment_method.type, `DIRECT_BANK`)
  })

  test.serial(`invoice - create invoice with crypto`, async t => {
    if (isEmpty(createdTransaction))
      throw new Error(`transaction empty!`)
    const paymentMethodUsecase = await PaymentMethodUsecase(_context)

    const { value: paymentMethods } = await paymentMethodUsecase.fetchPaymentMethods({
      type: `CRYPTO`,
    })
    if (isEmpty(paymentMethods))
      throw new Error(`empty payment methods - crypto`)

    const paymentMethod = paymentMethods.find(method =>
      method.type === `CRYPTO`,
    )
    if (!paymentMethod)
      throw new Error(`payment method not found`)

    const invoiceUsecase = await InvoiceUsecase(_context)
    const invoiceResult = await invoiceUsecase.createInvoice({
      selected_payment_method: paymentMethod,
      transaction_id: createdTransaction.id,
      currency: `USD`,
    })
    if (!invoiceResult.isOk)
      throw invoiceResult.error
    const { value: invoice } = invoiceResult
    rollbacksPool.push({
      where: { id: invoice.id },
      deleteMethod: (await InvoiceDTOUtil(_context)).deleteInvoice,
    })

    t.is(invoice.status, `UNPAID`)
    t.is(invoice.request_amount, 20)
    t.is(invoice.pay_amount, invoice.request_amount + invoice.admin_fee)
    t.is(invoice.admin_fee, 0)
    t.is(invoice.currency, `USD`)
    t.is(invoice.transaction_id, createdTransaction.id)
    t.is(typeof invoice.payment_link, `string`)
    t.is(invoice.selected_payment_method.type, `CRYPTO`)
  })

  test.after(`clearing test data`, async () => {
    console.log(`start clearing...`)
    try {
      await Promise.all(rollbacksPool.map(
        async ({ deleteMethod, where }) => deleteMethod(where),
      ))
    } catch (error) {
      console.error({ error })
    }

    console.log(`start clearing done`)
  })
}

executeTest(testWrap)
