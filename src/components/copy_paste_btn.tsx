import React from 'react'
import { NextPage } from "next"
import { useSuccessPopup } from "./ui/popup_helper"

export const CopyPasteBtn: NextPage<{
  value: string | number
  class?: string
}> = ({ value, class: className }) => {
  const showAlert = () => {
    useSuccessPopup({ message: `${value} copied!` })
  }

  const copyVal = (e: any) => {
    e.preventDefault()
    navigator.clipboard.writeText(String(value))
    showAlert()
  }

  return (
    <>
      <button
        className={`btn mx-1 mt-1 icon-copy ${className ?? ""}`}
        onClick={copyVal}
      >
        {/* <i className="las la-copy icon-copy"></i> */}
      </button>
    </>
  )
}
