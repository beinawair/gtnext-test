import { Item } from "@models/checkout_transaction"
import React from "react"
export const ItemCard = (props: { item: Item }) => {
  const { item } = props

  const formatCurrency = (val: number, curr: string) => {
    let NumberFormatString = Intl.NumberFormat('en-US');

    if (curr === 'IDR') {
      return (`Rp ${NumberFormatString.format(val)}`)
    } else if (curr === 'USD') {
      return (`$ ${NumberFormatString.format(val)}`)
    }
  }


  return (
    <div className="py-1">
      <div className="my-2 p-3 card-wrapper shadow rounded">
        <div className="item-desc">
          <p className="fs-6 p-0 m-0 text-secondary">{item.name ??'Rp 0'},-</p>
          <p className="text-xs p-0 m-0">{item.description ?? 'Rp 0'},-</p>
        </div>
        <p className="item-qty text-secondary pt-2 m-0">{item.qty ?? ''}</p>
        <p className="item-price text-secondary p-0 m-0 ">{formatCurrency(item.cost_base, item.base_currency) ?? 'Rp 0'},-</p>
      </div>
    </div>
  )
}
