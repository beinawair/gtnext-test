import { Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core"
import { MerchantTransaction } from "@server/core/domain/merchant_transaction/models/merchant_transaction"
import { PaymentMethod } from "@server/core/domain/payment_method/models/payment_method"
import { Invoice } from "@server/core/domain/invoice/models/invoice.model"
import { mapToOne } from "@turnkeyid/utils-ts"
import { MikroOrmBaseEntity } from "@turnkeyid/utils-ts/utils"
import { MerchantTransactionEntity } from "./merchant_transaction.entity"

@Entity({ collection: `invoice` })
export class InvoiceEntity
  extends MikroOrmBaseEntity
  implements Invoice {
  @Property()
  public selected_payment_method!: PaymentMethod

  @Property()
  public status!: Invoice['status']

  @Property()
  public request_amount!: number

  @Property()
  public admin_fee!: number

  @Property()
  public pay_amount!: number

  @Property()
  public currency!: "IDR" | "USD"

  @Property()
  public transaction_id!: string

  @ManyToOne(() => MerchantTransactionEntity)
  public transaction!: MerchantTransaction

  @Property({ nullable: true })
  public payment_link?: Invoice['payment_link']

  @Property({ nullable: true })
  public details?: Invoice['details']

  @Property({ nullable: true })
  public debug?: Invoice['debug']

  static mapToModel = (entity: unknown) => {
    const result = mapToOne(Invoice.factory, entity)
    if (result.isOk)
      return result.value

    throw result.error
  }
}
