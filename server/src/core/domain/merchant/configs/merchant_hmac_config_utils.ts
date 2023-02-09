import { mainLogger } from "@server/core/logger/gtnext_logger"
import { BaseError, easyReadFile, find, isEmpty, mapToMany } from "@turnkeyid/utils-ts"
import path from "path"
import { MerchantHmacConfig } from "../models/merchant_hmac_config"

export const getMerchantHmacConfigByMerchantId = async <Strict extends boolean = true>(
  merchantId: string,
  _strict?: Strict,
): Promise<
Strict extends true
  ? MerchantHmacConfig
  : (MerchantHmacConfig | undefined)
> => {
  try {
    const node_environment = process.env.NODE_ENV
    if (!node_environment)
      throw new BaseError(`[merchantHmacConfig:Err]: invalid environment`, { node_environment })
    
    const fromContent = easyReadFile<{ configs: MerchantHmacConfig[] }>(
      path.resolve(process.env.STORAGE_PATH ?? ``, `./configs/merchant_hmac_config.cred.json`),
    )
    if (isEmpty(fromContent) || !Array.isArray(fromContent?.configs))
      throw new BaseError(`[merchantHmacConfig:Err]: malformed config source!`, { fromContent })
  
    const validateMerchantHmacConfig = (data: Record<string, any>): boolean =>
      !isEmpty(data.merchant_id) && !isEmpty(data.merchant_hmac_secret_key) && !isEmpty(data.environment)

    const configs = mapToMany(data => {
      if (!validateMerchantHmacConfig(data))
        throw new Error(`config invalid`)

      return new MerchantHmacConfig(data.merchant_id, data.merchant_hmac_secret_key, data.environment)
    }, [...fromContent.configs])

    if (!configs.isOk)
      throw new BaseError(`[merchantHmacConfig:Err]: map failed`, { configs })
    
    const config = find(configs.value, {
      environment: node_environment.toUpperCase(),
      merchant_id: merchantId,
    })

    if (isEmpty(config))
      throw new Error(`[merchantHmacConfig:Err] config not found! merchant id: ${ merchantId }, environment: ${ node_environment }`)
    
    return config
  } catch (error) {
    mainLogger(`getMerchantHmacConfig:Err`, { error }, `error`)
    
    _strict === undefined
      ? (_strict = true as any) 
      : void 0
  
    if (_strict)
      throw new Error(`[merchantHmacConfig:Err] failed, check debug log!`)
    else
      return void 0 as any
  }
}
