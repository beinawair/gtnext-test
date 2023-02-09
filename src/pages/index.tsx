import React from 'react'
import type { NextPage } from "next"
import Head from "next/head"
import styles from "@styles/home.module.scss"

const Home: NextPage = () => {
  return (
    <div className='py-4 h-100 flex flex-col justify-center items-center'>
      <div className="flex justify-center py-4">
        <img src="/assets/images/logo-main.png" alt="Logo TurnkeyID" className='img-fluid w-50 object-center'/>
      </div>
      <h1 className='text-center text-4xl'>Turnkey Boilerplate</h1>
      <h4 className='text-xl text-center'>NextJS 13 + TailwindCSS + Typescript</h4>
      <a href="https://turnkey.id/" target='_blank' rel='noopener noreferrer'>
        <p className='text-slate-600'>Visit Our site</p>
      </a>
    </div>
  )
}

export default Home
