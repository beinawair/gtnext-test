import type { MikroOrmBaseDatabaseORMType } from "@turnkeyid/utils-ts/utils"
import { MikroOrmBaseDatabaseORM } from "@turnkeyid/utils-ts/utils"
import { GtNextMongoDBDatabaseClient } from "../clients/gtnext_database_client"

export const GtNextBaseDatabaseOrm: MikroOrmBaseDatabaseORMType = <Model, Entity>(
  _context,
  entity,
  options,
) => MikroOrmBaseDatabaseORM<Model, Entity>(
  _context,
  entity,
  { injections: { client: GtNextMongoDBDatabaseClient(_context) }, ...options },
)
