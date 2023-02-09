
import type { FileObject } from './models/file_object'
import type { HttpClientConfig } from './models/http_client_config.port'

export type HttpClient = {

  setOptions(configs: HttpClientConfig): HttpClientConfig
  getOptions(): HttpClientConfig

  get(url: string, data?: any, configs?: HttpClientConfig): Promise<any>
  getFile(url: string, data?: any, configs?: HttpClientConfig): Promise<FileObject | undefined>
  post(url: string, data: any, configs?: HttpClientConfig): Promise<any>
  put(url: string, data: any, configs?: HttpClientConfig): Promise<any>
  delete(url: string, data: any, configs?: HttpClientConfig): Promise<any>
}
