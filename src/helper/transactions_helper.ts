export const getDataStorage = () => window.sessionStorage.getItem(`ut_ts`)
export const saveDataStorage = (data: any) => {
  window.sessionStorage.setItem(`ut_ts`, data)
}

export const removeDataStorage = () => {
  window.sessionStorage.removeItem(`ut_ts`)
}

export const getDataTsStorage = () => window.sessionStorage.getItem(`ut_tsx`)
export const saveDataTsStorage = (data: any) => {
  window.sessionStorage.setItem(`ut_tsx`, data)
}

export const removeDataTsStorage = () => {
  window.sessionStorage.removeItem(`ut_tsx`)
}
