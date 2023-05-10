import { modelFactory } from "@turnkeyid/utils-ts/web"

export class RegisterRequests {
    constructor(
      public name: string,
      public email: string,
      public password: string,
      public phone: string,
      public country: string,
      public role: string
    ) {}
  
    static factory = modelFactory(RegisterRequests)
  }
  