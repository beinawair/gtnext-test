import type { RequestContext } from '@server/core/models/request_context'
import { NusagateApi } from '@server/gateway/payment_gateways/nusagate/nusagate_api'
import { executeTest } from '@server/__tests__/common/execute_test'
import { generateUUID, getDateOffset } from '@turnkeyid/utils-ts'
import test from 'ava'

const testWrap = (_context: RequestContext) => {
  test(`nusagateGateway - create an invoice`, async t => {
    const api = await NusagateApi(_context)

    const result = await api.createPaymentCrypto({
      description: `TEST`,
      dueDate: getDateOffset(Date.now(), 3, `h`).toDate(),
      email: `${ generateUUID(4) }@gmail.com`,
      externalId: generateUUID(24),
      // phoneNumber: `0`,
      price: 10,
    })

    if (!result.isOk)
      throw t.fail(`${ result.error?.message }`)

    t.is(result.value.meta.statusCode, 200)
  })
}

executeTest(testWrap)
