import { BaseError } from "@turnkeyid/utils-ts/web"

export class HttpClientError extends BaseError {
  name = `HTTP_CLIENT_ERROR`
  constructor(public message: string, public debug?: Record<string, any>) {
    super(message)
  }
}
