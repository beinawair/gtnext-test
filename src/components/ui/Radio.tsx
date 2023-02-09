import React from 'react'
import style from "@styles/payment.module.css"
const Radio = ({ title, value }) => {
  return (
    <div className={style.radiocontainer}>
      <input
        className={style.formradio}
        type="radio"
        name="payment"
        id={title}
        value={value}
        required
      />
      <label className={style.label} htmlFor={title}>
        {title}
      </label>
    </div>
  )
}

export default Radio
