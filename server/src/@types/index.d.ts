import express from "@server/ui/server/@types/express"
import '@server/ui/server/@types/express'


declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STORAGE_PATH?: string,
      ROOT_PATH?: string,
      IS_ENV_LOADED?: string,
    }
  }
}