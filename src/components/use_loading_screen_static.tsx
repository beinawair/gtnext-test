import React from 'react'
import Head from "next/head"
import { useEffect, useState } from "react"
import { useMainStore } from "../pages_helpers/payments/_store/main_store"

export const LoadingHydrationStatic = () => {
  const [loading, _loading] = useState(true)
  const { hasHydrated } = useMainStore()
  const isBrowser = typeof window !== "undefined"
  useEffect(() => {
    if (hasHydrated && isBrowser) {
      _loading(false)
    }
  }, [hasHydrated, isBrowser])

  const style = `
    .spinner-background {
      position: fixed;
      z-index: 2;
      background: #1c2022;
      margin: 0px;
      padding: 0px;
      min-height: 100vh;
      min-width: 100vw;
    }

    .spinner-container {
      min-height: 100vh;
      min-width: 100vw;
      align-items: center;
      display: grid;
      text-align: center;
      justify-items: center;
      align-content: center;
    }

    .spinner-container *{
      text-align: center;
      display: inline-block;
    }

    .spinner {
      width: 70px;
      height: 70px;
      border: 7px solid #ff23693b;
      border-radius: 50%;
      border-top-color: #ff2369;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        -webkit-transform: rotate(360deg);
      }
    }
  `

  return loading ? (
    <>
      <Head>
        <style>{style}</style>
      </Head>
      <div className="spinner-background">
        <div className="row spinner-container">
          <div>
            <div className="spinner"></div>
          </div>
          <div>
            <p className="text-white">Loading website data and content...</p>
          </div>
        </div>
      </div>
    </>
  ) : null
}
