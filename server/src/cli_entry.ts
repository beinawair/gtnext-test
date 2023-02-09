process.env.NODE_ENV = `DEVELOPMENT`
import { EnvLoader as EnvironmentLoader } from "./core/config/env_loader"

const environment = EnvironmentLoader()

import { asyncAwaitMap } from "@turnkeyid/utils-ts"
import { program as commander } from 'commander'
import { mainLogger } from "./core/logger/gtnext_logger"
import { PaymentMethodSeedUtil } from "@server/core/domain/payment_method/utils/payment_method_seed"

const main = async () => {
  const { CLIENT_IDS: clientIds } = process.env
  if (!clientIds?.length) throw new Error(`no client id(s)`)
  const clientIDS = String(clientIds).split(`;`)

  const ops: Array<{ clientID: string }> = []
  clientIDS.map(clientID =>
    ops.push({
      clientID,
    }),
  )

  commander
    .option(`-r, --run <command>`, `starting command`, String)
    .option(`-help, --help`, `show this`, String)
  commander.parse()

  const cliOptions = commander.opts()

  await asyncAwaitMap(
    ops,
    async ({ clientID }) => {
      switch (String(cliOptions.run)) {
        case `seed_payment_method`: {
          const paymentMethodSeedUtil = await PaymentMethodSeedUtil({ merchant_id: clientID })
          await paymentMethodSeedUtil.seed()
          break
        }

        default: {
          console.error(`no command passed`)
          commander.help()
          process.exit(1)
        }
      }
    },
  )
    .then(() => {
      console.log(`CLI:DONE`)
    })
    .catch(
      error => {
        mainLogger(`CLI:FatalErr`, { error }, `error`)
      },
    ).finally(() => {
      console.log(`exit...`)
      setTimeout(() => {
        process.exit(0)
      }, 1000)
    })
}

main()
  .catch(
    async error => mainLogger(`CLI:FatalErr`, { error }, `ERROR`),
  )
