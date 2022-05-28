import { PageOffset } from "./page_offset.ts"
import { Stream } from "./stream.ts"

export interface StreamProvider {
  get id(): string
  get streams(): Stream[]
  get nextPageOffset(): PageOffset

  setPageSize(pageSize: number): StreamProvider
  setPageOffset(pageOffset: PageOffset): StreamProvider
  readStreams(): Promise<void>
}