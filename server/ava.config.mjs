
const avaConfig = {
  files: [
    `tests/**/*.spec.*`,
    `src/**/__tests__/**/*.spec.*`,
    `!**/*deprecate*`,
    `!coverage/*`,
  ],
  timeout: `5m`,
  extensions: [`ts`],
  require: [`@swc-node/register`, `tsconfig-paths/register`],
  environmentVariables: {
    TS_NODE_PROJECT: `tsconfig.test.json`,
    NODE_ENV: `TEST`,
  },
  concurrency: 10,
  limit: 10,
  verbose: true,
}

export default avaConfig
