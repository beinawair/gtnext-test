import { prettyLoggerFactory } from '@turnkeyid/utils-ts/utils'

export const baseLoggerUtil = prettyLoggerFactory(`GT_NEXT`, {
  logFilePrefix: `gt_next_log`,
  debugging: `short`,
})
export const mainLogger = baseLoggerUtil.log
