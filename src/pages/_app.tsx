import "@styles/global.css"
import "@styles/main.scss"
import React from 'react'
import type { AppProps } from "next/app"

// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css"

function GateCashFrontendApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

export default GateCashFrontendApp
