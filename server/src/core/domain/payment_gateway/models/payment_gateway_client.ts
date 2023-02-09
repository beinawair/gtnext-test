import type { RequestContext } from "@server/core/models/request_context"

export type PaymentGatewayClient = (
  _context: RequestContext,
  bypassConfig: any,
) => Promise<{
  requestCreateVirtualPayment: any;
  checkPaymentStatus: any;
}>
