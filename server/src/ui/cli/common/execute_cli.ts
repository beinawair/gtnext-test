process.env.NODE_ENV = `HARDCODE`
import EnvLoader from "@server/core/config/env_loader"

const env = EnvLoader()

import type { RequestContext } from "@server/core/models/request_context"

export const executeCliMain = (main: (context: RequestContext) => Promise<any>, opt?: {
  exitOnDone?: boolean;
}) => {
  const { exitOnDone } = opt ?? { exitOnDone: true }
  process.on(`message`, (message?: string) => {
    const [_, clientID] = message ? message.split(`:`) : []
    main({ merchant_id: clientID })
      .catch(error => {
        console.error(error)
        process.emit(`rejectionHandled`, error)
      })
      .then(() => exitOnDone && process.exit(0))
  })

  if (
    (process.argv[2] === `-c` || process.argv[2] === `--client`)
    && process.argv[3]
  ) {
    const clientID = process.argv[3]
    main({ merchant_id: clientID })
      .catch(error => {
        console.error(error)
        process.emit(`rejectionHandled`, error)
      })
      .then(() => exitOnDone && process.exit(0))
  }
}
