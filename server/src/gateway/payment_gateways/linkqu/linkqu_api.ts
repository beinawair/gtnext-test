import type { Result, ErrorResult } from "@turnkeyid/utils-ts"
import { DeepObjectPlainMerge, mapToOne, randomUUID, getDateOffset, getFormattedDate, modelValidator, Result_ } from "@turnkeyid/utils-ts"
import type { RequestContext } from "@server/core/models/request_context"
import type { MerchantPaymentStatusType } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import { MerchantPaymentStatus } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import type { CreateInvoiceRequest } from "@server/core/domain/payment_gateway/models/create_invoice"
import { AxiosHttpClient } from "@turnkeyid/utils-ts/utils"
import { baseLoggerUtil } from "@server/core/logger/gtnext_logger"
import type { LinkQuCreatePaymentRequest } from "./models/linkqu_api_model"
import { LinkQuCreatePaymentResponse, LinkQuCheckStatusResponse } from "./models/linkqu_api_model"
import { getPaymentMethodDetail } from "@server/core/domain/payment_method/utils/get_payment_method_detail"
import { getLinkQuConfig } from "@server/gateway/payment_gateways/linkqu/config/linkqu_config_util"
import type { LinkQuConfig } from "@server/gateway/payment_gateways/linkqu/config/linkqu_config"

const paymentGatewayLogger = baseLoggerUtil.child(`LINKQU`, {
  logFilePrefix: `linkqu_api_log`,
}).log

const { BYPASS_CHECK_PAYMENT_STATUS } = process.env

export const LinkQUApi = async (
  _context: RequestContext,
  options?: {
    overrideConfig?: LinkQuConfig;
  },
) => {
  const { merchant_id: merchantId } = _context
  const _config = DeepObjectPlainMerge(await getLinkQuConfig(_context) ?? {}, options?.overrideConfig ?? {}) as LinkQuConfig | undefined
  if (!_config)
    throw new Error(`linkQU config invalid!`)

  const _httpClient = AxiosHttpClient({
    name:'LinkQUApi'
  })

  _httpClient.setOptions({
    url: _config?.host,
    headers: {
      /* eslint-disable @typescript-eslint/naming-convention */
      'client-id': _config.credentials.client_id,
      'client-secret': _config.credentials.client_secret,
      /* eslint-enable @typescript-eslint/naming-convention */
    },
  })

  // !NOTE: TIME INPUT MUST IN UTC!
  // @datetime: must be EPOCH (not MS)
  const _getLinkQuExpiredTime = (datetime: number) => {
    // Format: YYYYMMDDHHmmss, WIB
    const time = getDateOffset(datetime * 1000, 7, `h`).valueOf()
    return getFormattedDate(time, `YYYYMMDDHHmmss`)
  }

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

  const createVirtualPayment = async (
    _request: CreateInvoiceRequest,
  ) => {
    const responseValidator = (response: any) => {
      // Match condition: get response and code is 00
      if (typeof response === `object` && response.response_code === `00`)
        return Result_.ok(response)
      paymentGatewayLogger(`createVirtualPayment:Err`, { request: _request, response }, `error`)
      return Result_.err(`[LinkQuResponse:Err]: error, check debug log!`)
    }

    if (!_config)
      return Result_.err(`merchantId ${ merchantId } gateway config not found!`)

    const valid = modelValidator(_request)
    if (valid instanceof Error)
      return Result_.err(`input invalid, error: ${ JSON.stringify(valid.message) }`)

    const requestUrl = `linkqu-partner/transaction/create/va`
    const requestInput: LinkQuCreatePaymentRequest = {
      ..._request,
      bank_code: getPaymentMethodDetail(_request.payment_method).getVADetail().code,
      expired: _getLinkQuExpiredTime(_request.expired),
      customer_name: `- ${ _config.additional_config?.customer_name_code } ${ _request.customer_name }`,
      username: _config.credentials.username,
      pin: _config.credentials.pin,
      partner_reff: `${ _config.additional_config?.partner_reff_code }${ randomUUID(20) }`,
    }

    const response = await _handleResult<LinkQuCreatePaymentResponse>(
      _httpClient.post(requestUrl, requestInput),
      {
        thenHandler: responseValidator,
      },
    )
    if (!response.isOk) {
      paymentGatewayLogger(`createVirtualPayment:Err`, { request: _request, error: response.error }, `error`)
      return response
    }

    const mappedResult = mapToOne(LinkQuCreatePaymentResponse.factory, response.value)

    if (!mappedResult.isOk)
      return mappedResult

    // Add va prefix to response
    if (getPaymentMethodDetail(_request.payment_method).getVADetail().va_prefix)
      mappedResult.value.virtual_account = `${ getPaymentMethodDetail(_request.payment_method).getVADetail().va_prefix }${ mappedResult.value?.virtual_account }`

    paymentGatewayLogger(`createVirtualPayment:debug`, { result: mappedResult.value }, `silent`)

    return mappedResult
  }

  const checkPaymentStatus = async (
    input: {
      partner_reff: string;
    },
  ) => {
    if (BYPASS_CHECK_PAYMENT_STATUS === `true`)
      return Result_.ok({ status: MerchantPaymentStatus[0] })

    const { partner_reff } = input

    const endpointUrl = `linkqu-partner/transaction/payment/checkstatus`
    const responseValidator = (res: any) => {
      // Match condition: get response and code is 00
      if (typeof res === `object`) {
        if (res.rc === `00`) 
          return Result_.ok(res)

        if (res.rc === `404`) {
          return Result_.ok({
            data: {
              status_trx: `pending`,
            },
          })
        }
      }

      paymentGatewayLogger(`checkPaymentStatus`, { response: res })
      return Result_.err(`[LinkQuResponse:Err]: error, check debug log!`)
    }

    const requestInput: {
      username: string; partnerref: string;
    } = { username: _config.credentials.username, partnerref: partner_reff }

    const response = await _handleResult(
      _httpClient.get(`${ _config?.host }/${ endpointUrl }`, requestInput),
      {
        thenHandler: responseValidator,
      },
    )
    if (!response.isOk)
      return response
    const mapped = mapToOne(LinkQuCheckStatusResponse.factory, {
      ...response.value,
      ...response?.value?.data,
    })

    return Result_.ok({
      status: _mapToPaymentStatusType(mapped.value?.status_trx?.toLowerCase() ?? ``),
    })
  }

  const _mapToPaymentStatusType: (value: string) => MerchantPaymentStatusType
  = value => (value === `success`) ? `SUCCESS` : ((value === `failed`) ? `FAILED` : `PENDING`)

  return {
    createVirtualPayment,
    checkPaymentStatus,
    getConfig: () => _config,
  }
}
