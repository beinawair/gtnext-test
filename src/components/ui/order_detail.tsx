import React from 'react'
import { Transaction } from "@models/checkout_transaction"
import { ItemCard } from "./item_card"

export const OrderDetailComponent = (props: { transaction?: Transaction }) => {
  const { transaction } = props

  const formatIDR = (val: number) => {
    let idrString = Intl.NumberFormat("en-US")
    return `Rp ${idrString.format(val)}`
  }

  const getTax = (transaction) => {
    return (
      (transaction.order_detail.tax_percentage ?? 0) *
      transaction.order_detail.total.cost_base
    )
  }
  return transaction ? (
    <div>
      <div className="order-summary">
        <h5 className="fw-bold fs-6 border-bottom pb-2">Order Detail</h5>

        <div className="order-wrapper">
          <div className="order-header">
            <p className="p-0 m-0 text-xs">Item</p>
            <p className="p-0 m-0 text-xs">Qty</p>
            <p className="p-0 m-0 text-xs">Total Price</p>
          </div>

          {transaction.order_detail.items.length > 0 ? (
            transaction.order_detail.items?.map((item, k) => (
              <ItemCard key={k} item={item} />
            ))
          ) : (
            <p>no order</p>
          )}

          <div className="order-price">
            <div className="price-item">
              <p className="p-0 m-0 text-xs">Sub Total</p>
              <p className="p-0 m-0 text-xs">
                {formatIDR(transaction.order_detail.total.cost_base)},-
              </p>
            </div>
            {/* <div className="price-item">
              <p className="p-0 m-0 text-xs">Admin Fee</p>
              <p className="p-0 m-0 text-xs">Rp 0,-</p>
            </div> */}
            <div className="price-item">
              <p className="p-0 m-0 text-xs">Tax</p>
              <p className="p-0 m-0 text-xs">
                {formatIDR(getTax(transaction))}
                ,-
              </p>
            </div>
            <div className="price-item">
              <p className="p-0 m-0">Total</p>
              <p className="p-0 m-0">
                {formatIDR(
                  transaction.order_detail.total.cost_base + getTax(transaction)
                )}
                ,-
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="order-summary">
      <h5 className="fw-bold fs-6 border-bottom pb-2">Order Detail</h5>

      <div className="order-wrapper">
        <div className="order-header">
          <p className="p-0 m-0 text-xs">Item</p>
          <p className="p-0 m-0 text-xs">Qty</p>
          <p className="p-0 m-0 text-xs">Total Price</p>
        </div>
        <p className="text-secondary   text-center py-4" style={{ fontStyle: 'italic' }}>No order</p>
      </div>
    </div>
  )
}
