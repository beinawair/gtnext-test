import { baseLoggerUtil } from "@server/core/logger/gtnext_logger"

export const serverLogger = baseLoggerUtil.child(`SERVER`, {
  logFilePrefix: `api`,
}).log
