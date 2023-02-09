import React from 'react'
import { RingSpinnerOverlay } from "react-spinner-overlay"
import { useCallback } from "react"
import { useOverlayStore } from "@/pages_helpers/payments/_store/main_store"

export const useLoadingOverlay = (req?: { key?: string }) => {
  const { key } = req ?? {}

  const { isLoading, setIsLoading } = useOverlayStore()
  const setLoading = useCallback(() => setIsLoading(true), [])
  const unLoading = useCallback(() => setIsLoading(false), [])
  return {
    isLoading,
    setLoading,
    unLoading,
  }
}

export const LoadingOverlay = () => {
  const { isLoading } = useOverlayStore()
  return <RingSpinnerOverlay loading={isLoading} overlayColor="#333333ee" />
}
