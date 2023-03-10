import type { Buffer } from "buffer"
import { modelFactory } from "@turnkeyid/utils-ts/web"

export type FileObjectContent = Buffer | string
export type EncodingType = "utf8" | "ascii" | "binary" | "base64"

export class FileObject {
  constructor(
    public content: unknown,
    public filename: string,
    public size: number,
    public mimeType: string,
    public path: string,
    public relativePath?: string,
    public encoding?: EncodingType,
    public lastModified: string = new Date().toISOString(),
    public sourceType?: "LOCAL" | "CLOUD",
    public oriPath?: string,
    public oriName?: string
  ) {}

  static factory = modelFactory(FileObject, {
    autoGeneratedProp: [`lastModified`],
  })

  public getContent = <T>(): T => this.content as T
}
