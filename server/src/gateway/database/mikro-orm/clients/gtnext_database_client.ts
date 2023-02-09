import { serverConfig } from "@server/core/config/server_config"
import type { MikroOrmDatabaseClientType } from "@turnkeyid/utils-ts/utils"
import { MikroOrmDatabaseClient } from "@turnkeyid/utils-ts/utils"
import { MikroOrmDatabaseConfig } from "../configs/mikroorm_database_config"
import { MerchantTransactionEntity } from "../entities/merchant_transaction.entity"
import { PaymentMethodEntity } from "../entities/payment_method.entity"
import { InvoiceEntity } from "../entities/invoice.entity"

export const GtNextMongoDBDatabaseClient: MikroOrmDatabaseClientType
= (
  _context,
  options,
) => MikroOrmDatabaseClient(
  _context,
  {
    entities: [
      MerchantTransactionEntity,
      PaymentMethodEntity,
      InvoiceEntity,
    ],
    overrideConfig: MikroOrmDatabaseConfig()
      .getConfig({
        id: _context.clientID,
        env: serverConfig().env,
      }),
    ...options,
  },
)
