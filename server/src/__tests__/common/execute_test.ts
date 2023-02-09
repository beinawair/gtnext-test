import { EnvLoader } from '@server/core/config/env_loader'
import type { RequestContext } from '@server/core/models/request_context'
import 'reflect-metadata'

const env = EnvLoader()

export const executeTest = (main: (context: RequestContext) => Promise<void> | void) => {
  try {
    const environmentClientIds = process.env.CLIENT_IDS
    if (!environmentClientIds?.length) 
      throw new Error(`no client id(s)`)

    const clientIDs = environmentClientIds.split(`;`)
    for (const clientID of clientIDs) {
      console.info(`RUNNING TEST - client id: ${ clientID }`)
      const run = main({ merchant_id: clientID })
      // Check if it result promise
      if (run instanceof Promise) {
        run.catch(error => {
          process.emit(`uncaughtException`, error)
        })
      }
      // ?.then(() => process.exit(0))
    }
  } catch (error) {
    console.error(`>>>EXECUTE TEST ENCOUNTER ERROR!!!`)
    console.error(error)
    throw error
  }
}
