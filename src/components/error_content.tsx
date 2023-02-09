import React from 'react'
import { NextPage } from "next"

export const ErrorContent: NextPage<{ message?: string, content?: any }> = ({ content,message }) => {
  return (
    <>
      <div className='container'>
        <h3>Error Occurred</h3>
        <p className="">
          Message: {message}
        </p>
      </div>
    </>
  )
}