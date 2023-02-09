import "@styles/globals.css"
import "@styles/payment.css"
import "@styles/cardStyle.css"
import React from 'react'
import type { AppProps } from "next/app"

// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css"

function GateCashFrontendApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* <LoadingHydrationStatic /> */}
      <Component {...pageProps} />
    </>
  )
}

export default GateCashFrontendApp
