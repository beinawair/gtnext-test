import React from 'react'
import {
  Splide as Spliced,
  SplideSlide as SplicedSlide,
} from "@splidejs/react-splide"
import { paymentOptions } from "../../../config/constants"
import "@splidejs/react-splide/css/sea-green"

const PaymentMethodSlider = ({
  pickVA,
  pickCrypto,
  transaction_token: transaction_token,
}: {
  pickVA: () => void
  pickCrypto: () => void
  transaction_token?: string
}) => {
  return (
    <div className="mx-auto">
      <Spliced
        options={{
          rewind: true,
          width: 800,
          gap: "1rem",
          pagination: false,
        }}
        aria-label="Payment Methods"
      >
        <SplicedSlide>
          <div className="py-3 card-slider">
            <img
              src={paymentOptions.virtualAccount.icon}
              alt="Virtual Account"
              className="slider-image"
            />
            <h4 className="slider-title">
              {paymentOptions.virtualAccount.title}
            </h4>
            <p className="slider-description">
              {paymentOptions.virtualAccount.desc}
            </p>
            <div className="btn-container">
              <button type="button" className="slider-btn" onClick={pickVA}>
                Select
              </button>
            </div>
          </div>
        </SplicedSlide>

        <SplicedSlide>
          <div className="py-3 card-slider">
            <img
              src={paymentOptions.crypto.icon}
              alt="Crypto"
              className="slider-image"
            />
            <h4 className="slider-title">{paymentOptions.crypto.title}</h4>
            <p className="slider-description">{paymentOptions.crypto.desc}</p>
            <div className="btn-container">
              <button type="button" className="slider-btn" onClick={pickCrypto}>
                Select
              </button>
            </div>
          </div>
        </SplicedSlide>
      </Spliced>
    </div>
  )
}

export default PaymentMethodSlider
