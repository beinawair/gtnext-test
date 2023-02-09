import type { PaymentGatewayConfig } from "@server/core/domain/payment_gateway/models/payment_gateway_config"
import type { RequestContext } from "@server/core/models/request_context"
import { getNusagateConfig } from "@server/gateway/payment_gateways/nusagate/config/nusagate_config"
import type { NusagateInvoiceResponse } from "@server/gateway/payment_gateways/nusagate/models/nusagate_api_res.port"
import type { Result, ErrorResult } from "@turnkeyid/utils-ts"
import { BaseError, isEmpty, Result_ } from "@turnkeyid/utils-ts"
import { AxiosHttpClient } from "@turnkeyid/utils-ts/utils"
import { Buffer } from 'buffer'

export const NusagateApi = async (
  _context: RequestContext,
  options?: {
    overrideConfig?: PaymentGatewayConfig;
  },
) => {
  const _clientHttp = AxiosHttpClient()
  const _config = options?.overrideConfig ?? await getNusagateConfig({
    merchant_id: _context.merchant_id,
    gateway_id: `NUSAGATE`,
  })

  if (isEmpty(_config))
    throw new Error(`NusagateAPI:FatalErr - config empty!`)

  _clientHttp.setOptions({
    url: _config?.host,
    headers: {
      Authorization: `Basic ${ Buffer
        .from(`${ _config?.credentials.api_key }:${ _config?.credentials.api_secret }`)
        .toString(`base64`) }`,
    },
  })

  const _handleResult = async <T, E extends ErrorResult=ErrorResult>(
    basicRes: Promise<T>, options?: {
      thenHandler?: (res: any) => Result<T>;
      catchHandler?: (error: Error) => Result<never, E>;
      finallyHandler?: () => undefined;
    },
  ): Promise<Result<T>> => basicRes
    .then(options?.thenHandler ?? Result_.ok)
    .catch(options?.catchHandler ?? Result_.err)
    .finally(options?.finallyHandler)

  const createPaymentCrypto = async (
    _request: {
      externalId: string;
      description: string;
      price: number;
      dueDate: Date;
      email: string;
      phoneNumber?: string;
    },
  ) => {
    try {
      const requestData = _request
      const endpoint = `/invoices`

      const result = await _handleResult<NusagateInvoiceResponse>(_clientHttp.post(
        endpoint,
        requestData,
      ))

      if (
        result.value?.meta.statusCode !== 200
        || !result.value.data.price
      ) {
        return Result_.err({
          message: `invalid nusagate response!`,
          debug: { response: result.value },
        })
      }

      return result
    } catch (error) {
      throw new BaseError({
        method: `createPaymentCrypto`,
        cause: error,
      })
    }
  }

  return { createPaymentCrypto, getConfig: () => _config }
}
