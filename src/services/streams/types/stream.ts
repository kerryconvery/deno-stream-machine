import { PageOffsets } from "./page_offset.ts"

export type Stream = {
  title: string
}

export type PagedStreams = {
  streams: Stream[],
  nextPageOffsets: PageOffsets
}
