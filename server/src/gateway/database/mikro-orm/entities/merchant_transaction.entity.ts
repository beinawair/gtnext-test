
import { Entity, Enum, Property } from "@mikro-orm/core"
import { MerchantPaymentStatus, MerchantPaymentStatusType, MerchantTransaction } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import { OrderDetail } from "@server/core/domain/merchant_transaction/models/order_detail"
import { UserDetail } from "@server/core/domain/merchant_transaction/models/user_detail"
import { mapToOne } from "@turnkeyid/utils-ts"
import { MikroOrmBaseEntity } from "@turnkeyid/utils-ts/utils"

@Entity({ tableName: `merchant_transaction` })
export class MerchantTransactionEntity
  extends MikroOrmBaseEntity
  implements MerchantTransaction {

  @Property()
  public order_detail!: OrderDetail

  @Property({
    nullable: true,
    type: `json`,
  })
  public callback!: {
      url: string;
      status: MerchantPaymentStatusType;
      data?: Record<any, any>;
      histories?: string[];
  }

  @Property()
  public expired_datetime!: number

  @Enum(() => MerchantPaymentStatus)
  public status!: MerchantPaymentStatusType

  @Property()
  public merchant_id!: string

  @Property()
  public transaction_url!: string

  @Property()
  public user_detail!: UserDetail

  @Property({ nullable: true })
  public redirect_url!: {
    success?: string;
    error?: string;
  }

  static mapToModel = (entity: unknown) => {
    const result = mapToOne(MerchantTransaction.factory, entity)
    if (result.isOk) 
      return result.value

    throw result.error
  }
}
