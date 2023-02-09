import React from 'react'
import { NextPage } from "next"

export const ErrorTooltip: NextPage<{ message?: string }> = ({ message }) => {
  return (
    <>
      <h6>{message ?? "Error: Invalid Request"}</h6>
    </>
  )
}