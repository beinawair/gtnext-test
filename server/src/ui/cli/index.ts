process.env.NODE_ENV = `HARDCODE`

import EnvLoader from "@server/core/config/env_loader"

const env = EnvLoader()

import * as path from "path"
import childProcess from "child_process"
import { existsSync } from "fs"
import { globbySync as globbySync } from "globby"
import { asyncAwaitMap } from "@turnkeyid/utils-ts"

const arguments_ = process.argv
const filepathWildC = arguments_[2]

const runScript = async (scriptPath: string, clientID: string) => new Promise((resolve, reject) => {
  // Keep track of whether callback has been invoked to prevent multiple invocations
  let invoked = false

  const forkProcess = childProcess.fork(scriptPath, [process.argv[2]])
  forkProcess.send(`APP_ID:${ clientID }`)

  // Listen for errors as they may prevent the exit event from firing
  forkProcess.on(`uncaughtException`, error => {
    if (invoked) return
    invoked = true
    reject(error)
  })

  // Listen for errors as they may prevent the exit event from firing
  forkProcess.on(`error`, error => {
    if (invoked) return
    invoked = true
    reject(error)
  })

  // Execute the callback once the process has finished running
  forkProcess.on(`exit`, code => {
    if (invoked) return
    invoked = true
    const error = code === 0 ? null : new Error(`exit code ${ code }`)
    error ? reject(error) : resolve(`OK`)
  })
})

let filePaths = globbySync([`./*${ filepathWildC }*.(ts|js|cjs)`], {
  cwd: path.resolve(__dirname),
})
if (filePaths.length === 0) {
  (() => {
    console.error({ filepathWildC })
    throw new Error(`no file match`)
  })()
}

// Filter index.ts
for (const [index, filepath] of filePaths.entries()) {
  if (filepath === `index.ts` || filepath === `index.js` || filepath === `index.cjs`) {
    delete filePaths[index]
    filePaths = filePaths.filter(value => !!value)
    continue
  }

  console.warn(`⚠️ file: ${ filepath } ⚠️`)
}

const EnvironmentClientIds = process.env.CLIENT_IDS
if (!EnvironmentClientIds?.length) throw new Error(`no client id(s)`)
const clientIDS = String(EnvironmentClientIds).split(`;`)

const ops: Array<{ filepath: string; clientID: string }> = []
filePaths.map(fp =>
  clientIDS.map(clientID =>
    ops.push({
      clientID,
      filepath: fp,
    }),
  ),
)

const run = async () => {
  await asyncAwaitMap(
    ops,
    async ({ clientID, filepath }) => {
      console.info(`${ clientID } - START CLI FILE ${ filepath } ...`, {
        clientID,
        filepath,
      })
      const filename = path.basename(filepath)

      !existsSync(path.join(__dirname, filename))
        && (function () {
          throw new Error(`${ filename } not found`)
        })()

      await runScript(path.join(__dirname, filename), clientID).catch(
        error => {
          throw error
        },
      )
    },
    1,
  )
}

run()
  .catch(error => {
    console.error({ error }) 
  })
  .finally()

