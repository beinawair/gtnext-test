# Turnkey ID BOILERPLATE NEXTJS + TYPESCRIPT + TAILWINDCSS

![TurnkeyID Logo](https://turnkey.id/assets/images/logo-black.png)

#### Server API for handling payments to third party payment gateway

[![GPLv3 License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/turnkey-devs/gtnext_payment_gateway/branch/master/graph/badge.svg?token=SRYRID5GH6)](https://codecov.io/gh/turnkey-devs/gtnext_payment_gateway)

## Features

- (wip)

## Installation

- (wip)

## Roadmap

- (wip)

## Authors

- [@turnkey-dev](https://github.com/turnkey-devs)

## Support

For support, email developer@turnkey.id or join our [Discord Channel](https://discord.gg/6WVJgJv3fH)
or create issue on the [repository](https://github.com/turnkey-devs/turnkey-api-proxy/issues)

## Tech Stack

**Client:** -

**Server:** Node, Express, Typescript

## Technical Information

### Available Payment Method Type

Direct Bank Transfer
> It directly transfer to BCA, no checking or callback

Virtual Account
> Connect to LinkQU or Any Virtual Account Provider, receive callback from provider

Crypto
> Connect to Nusagate or Any Crypto Account Provider, receive callback from provider

### MVP [Current]

only work with the LinkQU Payment gateway

### Alpha Flow

```txt
user side request for GET@/payment-method/direct-bank-transfer => return DirectBankTransfer {
  id, gateway_id, bank_name, account_number, account_name, admin_fee, etc...
   }

user side request for GET@/payment-method/virtual-account => return VirtualAccount {
  id, gateway_id, bank_name, virtual_account_number, account_name, admin_fee, etc...
   }

user side request for GET@/payment-method/crypto => return VirtualAccount {
  id, gateway_id, admin_fee, etc...
 }

then after receiving payment methods,
 DirectBankTransfer > user-client must immediately request create payment with specified payment method (direct bank) that responded by server, why? because standard

 Virtual Banks > user-client send create payment request based on selected available virtual account > receive response data for Virtual Account number etc

 Crypto > user-client must immediately request create payment with specified payment method (crypto) > receive callback then redirect / open new tab
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
