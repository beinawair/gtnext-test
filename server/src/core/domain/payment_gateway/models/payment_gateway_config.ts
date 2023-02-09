
export abstract class PaymentGatewayConfig {
  constructor(
    public merchant_id: string,
    public environment: string,
    public gateway_id: string,
    public host: string,
    public credentials: Record<string, any>,
    public host_secondary?: string,
    public admin_fee: number = 0,
    public additional_config?: Record<string, any>,
  ) {}
}
