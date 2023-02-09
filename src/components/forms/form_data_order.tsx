import React from 'react'
import { Transaction } from "@models/checkout_transaction"
import FormInput from "./form_input"

const FormDataOrder = (props: { transaction?: Transaction }) => {
  const { transaction } = props
  if (!transaction) return null

  const { items } = transaction?.order_detail ?? {}

  return (
    <div className="">
      <div className="py-2">
        <div className="item-form">
          <label htmlFor="">Item</label>
          <div className="item-wrapper">
            <div className="item-form-col">
              <div className="c-1 d-flex align-items-center form-group">
                <label htmlFor="buy">Buy</label>
                <input
                  type="text"
                  value={items?.[0]?.name}
                  readOnly={true}
                  className="form-control"
                />
              </div>

              <div className="c-2 d-flex align-items-center form-group">
                <label htmlFor="to">to</label>
                <input
                  type="text"
                  value={items?.[0]?.name}
                  readOnly={true}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-2">
        <FormInput
          label="Qty"
          name="email"
          id="email"
          extraClass=""
          extraFormClass=""
          readOnly={true}
          disabled={true}
          type="text"
          required={false}
          value={items?.[0]?.qty}
        />
      </div>

      <div className="py-2">
        <FormInput
          label="Subtotal"
          name="email"
          id="email"
          extraClass=""
          extraFormClass=""
          readOnly={true}
          disabled={true}
          type="text"
          required={false}
          value={items?.[0]?.base_currency ?? "" + items?.[0]?.cost_base ?? ""}
        />
      </div>
    </div>
  )
}

export default FormDataOrder
