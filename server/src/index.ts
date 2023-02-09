// ALWAYS RUN ENV LOADER BEFORE IMPORT ANYTHING
import 'reflect-metadata'
import { EnvLoader as EnvironmentLoader } from "./core/config/env_loader"

const env = EnvironmentLoader()

import { ApiApp } from "@server/ui/server/api_application"
import { mainLogger } from "./core/logger/gtnext_logger"

const main = async () => {
  const apiApp = new ApiApp()
  await Promise.all([
    apiApp.startApp(),
  ])
}

main().catch(async error =>
  mainLogger(`main:FatalErr`, { error }, `error`),
)

export default main
