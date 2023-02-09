import { MerchantRouter } from "./merchant/merchant.router"
import { TransactionRouter } from "./transaction/transaction.routes"
import { PaymentMethodRouter } from "./payment_method/payment_method.router"
import { SecretRouter } from "./secret/secret.router"
import { PaymentGatewayRouter } from "./callback/callback.router"

/* eslint-disable @typescript-eslint/naming-convention */
export const V1Routes = {
  '/transaction': TransactionRouter,
  '/payment-method': PaymentMethodRouter,
  '/secret': SecretRouter,
  '/merchant': MerchantRouter,
  '/callback': PaymentGatewayRouter,
}
/* eslint-enable @typescript-eslint/naming-convention */
