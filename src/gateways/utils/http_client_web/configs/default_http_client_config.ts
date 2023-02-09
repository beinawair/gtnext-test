import { toNumberOrUndefined } from "@turnkeyid/utils-ts/web"
import type { HttpClientConfig } from "../models/http_client_config.port"

export const DEFAULT_HTTP_CLIENT_CONFIG: HttpClientConfig = {
  timeout:
    toNumberOrUndefined(process.env[`HTTP_CLIENT_CONFIG_TIMEOUT`]) ?? 60 * 1000,
  ssl: process.env[`HTTP_CLIENT_CONFIG_SSL`] === `true` || false,
}
