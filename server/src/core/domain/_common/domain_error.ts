import { BaseError } from "@turnkeyid/utils-ts"

export class DomainError
  extends BaseError {
  public name = `DOMAIN_ERROR`
  public expose = false
}
