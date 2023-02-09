type RetryType = {
  result?: any;
  error?: Error | undefined;
  success: boolean;
}
export const retrySync = <R>(
  task: (lastRetry: RetryType | undefined, index: number, retries: RetryType[]) => R,
  maxRetry = 3,
  options?: {
    doEachFail?: (error: Error, index: number, retries: RetryType[]) => void | Promise<void>;
  },
): R => {
  const { doEachFail } = options ?? {}

  const retriesPool: RetryType[] = []

  for (const [index, _] of new Array(maxRetry).fill(0).entries()) {
    if (retriesPool.some(({ success }) => Boolean(success)))
      break

    try {
      const result = task(
        retriesPool[index - 1],
        index,
        retriesPool,
      )
      retriesPool.push({ success: true, result, error: void 0 })
    } catch (error) {
      if (doEachFail)
        doEachFail(error, index, retriesPool)

      retriesPool.push({ success: false, result: void 0, error })
    }
  }

  if (retriesPool.some(({ success }) => Boolean(success))) {
    const result = retriesPool.find(({ success }) => Boolean(success))
    return result?.result
  }

  throw retriesPool.find(({ error }) => Boolean(error))?.error
}
