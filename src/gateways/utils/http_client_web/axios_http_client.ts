import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import qs from "qs"
import * as AxiosLib from "axios"
import {
  dataSize,
  DeepObjectPlainMerge,
  isEmpty,
  omitUndefinedProperty,
} from "@turnkeyid/utils-ts/web"
import type { HttpClient } from "./http_client.port"
import type { HttpClientConfig } from "./models/http_client_config.port"
import { DEFAULT_HTTP_CLIENT_CONFIG } from "./configs/default_http_client_config"
import { HttpClientError } from "./common/errors/http_client_error.class"
import { FileObject } from "./models/file_object"

const Axios = AxiosLib.default

// const defaultLoggerOpt = {
//   logFilePrefix: `axios`,
// }
const _loggerUtil = console
const _logger = _loggerUtil.log

export const AxiosHttpClientWeb = (options?: {
  name?: string
  // logOptions?: DeepPartial<PrettyLoggerOptions>
  // logLevel?: PrettyLoggerLevel
}): HttpClient => {
  const { name } = options ?? {}

  // if (logOptions)
  //   _logger = _loggerUtil.child(name ?? `CUSTOM`, { ...defaultLoggerOpt, ...logOptions }).log

  const logLevel = `trace`

  const _client: AxiosInstance = Axios.create()
  const _configs: HttpClientConfig = DEFAULT_HTTP_CLIENT_CONFIG

  const setOptions = (options: HttpClientConfig) => {
    Object.assign(_configs, DeepObjectPlainMerge(_configs, options))
    return _configs
  }

  const getOptions = () => _configs

  const _getCurrentRequestConfigs = (
    requestConfigs?: HttpClientConfig
  ): AxiosRequestConfig => {
    const currentRequestConfigs =
      DeepObjectPlainMerge(_configs, requestConfigs ?? {}) ?? _configs

    const clientConfigs = omitUndefinedProperty<AxiosRequestConfig>({
      baseURL: currentRequestConfigs.url,
      timeout: currentRequestConfigs.timeout,
      data: currentRequestConfigs.data,
      headers: currentRequestConfigs.headers,
      responseType: currentRequestConfigs.responseType ?? `json`,
      // HttpsAgent: !mergedConfigs.ssl ? new https.Agent({
      // 	rejectUnauthorized: false,
      // edit
      // }) : undefined,
    })
    if (!clientConfigs) throw new HttpClientError(`config undefined`)
    return clientConfigs
  }

  const get = async (
    url: string,
    data?: any,
    configs?: HttpClientConfig
  ): Promise<any> => {
    try {
      const queryString = data && !isEmpty(data) ? `?${qs.stringify(data)}` : ``

      const requestConfigs = _getCurrentRequestConfigs({
        ...configs,
      })

      _logger(`get`, { url, data, configs: requestConfigs }, logLevel)
      const response = await _client
        ?.get(`${url + queryString}`, requestConfigs)
        .then((response_) => response_.data)
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              {
                respData,
                error,
              }
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })
      return response
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`get:Err`, { error, data, requestConfigs, configs }, `error`)
      throw error
    }
  }

  const _fileObjectMapper = (response: AxiosResponse, path: string) => {
    const { data } = response
    const contentDisposition =
      response?.data?.headers?.[`content-disposition`] ??
      response.headers?.[`content-disposition`]
    const filename =
      contentDisposition?.split(`filename=`)?.[1] ?? `downloaded_file.unknown`
    const filetype = response.headers[`content-type`]
    const size = dataSize(data)

    return new FileObject(
      data,
      filename.replace(/"/g, ``),
      size,
      filetype ?? ``,
      path,
      path
    )
  }

  const getFile = async (
    url: string,
    data?: any,
    configs: HttpClientConfig = { responseType: `arraybuffer` }
  ): Promise<FileObject | undefined> => {
    try {
      const queryString = !isEmpty(data) ? `?${qs.stringify(data)}` : ``

      const requestConfigs = _getCurrentRequestConfigs({
        ...configs,
      })

      _logger(`getFile`, { url, data, configs: requestConfigs }, logLevel)
      const response = await _client
        ?.get(`${url + queryString}`, requestConfigs)
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              error
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })

      if (response) return _fileObjectMapper(response, url + `${queryString}`)
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`getFile:Err`, { error, data, configs, requestConfigs }, `error`)
      throw error
    }
  }

  const post = async (
    url: string,
    data: any,
    configs?: HttpClientConfig
  ): Promise<any> => {
    try {
      const requestConfigs = _getCurrentRequestConfigs({
        ...configs,
      })

      _logger(`post`, { url, data, configs: requestConfigs }, logLevel)
      const response = await _client
        .post(url, data, requestConfigs)
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              error
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })
      return response.data
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`post`, { error, data, configs, requestConfigs }, `error`)
      throw error
    }
  }

  const put = async (
    url: string,
    data: any,
    configs?: HttpClientConfig
  ): Promise<any> => {
    try {
      const requestConfigs = _getCurrentRequestConfigs({ ...configs })

      _logger(`put`, { url, data, configs: requestConfigs }, logLevel)
      const response = await _client
        .put(url, data, requestConfigs)
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              error
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })
      return response.data
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`put`, { error, data, configs, requestConfigs }, `error`)
      throw error
    }
  }

  const doDeleteBody = async (
    url: string,
    data: any,
    configs?: HttpClientConfig
  ): Promise<any> => {
    try {
      const requestConfigs = _getCurrentRequestConfigs({ ...configs })

      _logger(`delete`, { url, data, configs: requestConfigs }, logLevel)
      const response = await _client
        .request({
          ...requestConfigs,
          method: `DELETE`,
          url,
          data,
        })
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              error
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })
      return response.data
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`delete`, { error, data, configs, requestConfigs }, `error`)
      throw error
    }
  }

  const doDelete = async (
    url: string,
    data: any,
    configs?: HttpClientConfig
  ): Promise<any> => {
    try {
      const requestConfigs = _getCurrentRequestConfigs({ ...configs })

      _logger(`delete`, { url, data, configs: requestConfigs }, logLevel)
      const queryString = !isEmpty(data) ? `?${qs.stringify(data)}` : ``
      const response = await _client
        .delete(url + queryString, requestConfigs)
        .catch((error) => {
          const respData = error?.response?.data
          if (error?.code === `ECONNABORTED`) {
            throw new HttpClientError(
              `Request Timeout ${error?.config?.timeout}ms`,
              error
            )
          }

          throw new HttpClientError(`request ${url} refused!`, {
            error,
            requestConfigs,
            respData,
          })
        })
      return response.data
    } catch (error) {
      const requestConfigs = _getCurrentRequestConfigs(configs)
      _logger(`delete`, { error, data, configs, requestConfigs }, `error`)
      throw error
    }
  }

  return {
    get,
    getFile,
    setOptions,
    getOptions,
    post,
    delete: doDelete,
    put,
  }
}
