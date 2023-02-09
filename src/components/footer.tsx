import React from 'react'
import { NextPage } from "next"

export const Footer: NextPage = () => {
  return (
    <>
      <footer>
        <div className='col-12 bg-dark p-2 text-white text-center'>
          &copy;2022 - GateCash.com
        </div>
      </footer>
    </>
  )
}