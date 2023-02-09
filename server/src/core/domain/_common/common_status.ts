import { createStringUnionType } from "@turnkeyid/utils-ts"

export const CommonStatus = [`PENDING`, `PROCESSING`, `FAILED`, `SUCCESS`, `CANCELED`, `ARCHIVED`, `DELETED`] as const
export type TypeOfCommonStatus = typeof CommonStatus[number]
export const { getValidValue: getCommonStatus } = createStringUnionType(CommonStatus)
