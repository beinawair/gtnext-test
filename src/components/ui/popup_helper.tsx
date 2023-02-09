import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const customSwal = withReactContent(Swal)

export const useServerErrorModal = (
  req: {
    message: string,
    errorCode?: string,
    title?: string,
    type?: "error" | "warning"
  },
  customOptions?: Record<string,any>
) => {
  const {type,message,errorCode,title,} = req
  return customSwal.fire({
    title: title ?? "We are sorry!",
    icon: type ?? 'error',
    html: ` ${message} <br /> <br /> <small>send this message to our staff! <br /> <a href='mailto:support@gate-cash.com'>support@gate-cash.com</a></small>\n <pre>${errorCode ?? '(ErrCode: C-01)'}</pre>`,
    ...customOptions
  })
}

export const useHandledErrorModal = (
  req: {
    message: string,
    title?: string,
    type?: "error" | "warning"
  },
  customOptions?: Record<string,any>
) => {
  const {type,message,title} = req
  return customSwal.fire({
    title: title ?? "We are sorry!",
    icon: type ?? 'error',
    html: ` ${message}`,
    ...customOptions
  })
}

export const useSuccessPopup = (
  req: {
    message: string,
    code?: string,
    title?: string,
    type?: "success" | "info"
  },
  customOptions?: Record<string,any>
) => {
  const { type, message, code, title, } = req
  return customSwal.fire({
    title: title ?? "Success!",
    icon: type ?? 'success',
    html: ` ${message} <br /> ${code ?? ''}`,
    ...customOptions
  })
}