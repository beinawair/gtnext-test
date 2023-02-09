import React from "react"
import { Transaction } from "@models/checkout_transaction"
import { isEmpty } from "@turnkeyid/utils-ts/web"
import FormInput from "./form_input"

const FormDataUser = (props: { transaction?: Transaction }) => {
  const { transaction } = props
  if (!transaction) return null

  return <div className=""></div>
}

export default FormDataUser
