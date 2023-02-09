import { Entity, Property } from "@mikro-orm/core"
import { PaymentMethod } from "@server/core/domain/payment_method/models/payment_method"
import { mapToOne } from "@turnkeyid/utils-ts"
import { MikroOrmBaseEntity } from "@turnkeyid/utils-ts/utils"

@Entity({ collection: `payment_method` })
export class PaymentMethodEntity
  extends MikroOrmBaseEntity
  implements PaymentMethod {
  @Property()
  public gateway_id!: PaymentMethod['gateway_id']

  @Property()
  public type!: PaymentMethod['type']

  @Property()
  public status!: PaymentMethod['status']

  @Property()
  public detail!: PaymentMethod['detail']

  @Property({ nullable: true })
  public requirement!: Record<any, any>

  static mapToModel = (entity: unknown) => {
    const result = mapToOne(PaymentMethod.factory, entity)
    if (result.isOk)
      return result.value

    throw result.error
  }
}
