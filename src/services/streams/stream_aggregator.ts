import { PageOffset, PageOffsets } from "./types/page_offset.ts"
import { PagedStreams, Stream } from "./types/stream.ts"

export class StreamAggregator {
  private streams: Record<string, Stream[]> = {}
  private pageOffsets: Record<string, PageOffset> = {}
  
  public addStreams(streamSource: string, streams: Stream[], nextPageOffset: PageOffset): StreamAggregator {
    this.streams[streamSource] = streams
    this.pageOffsets[streamSource] = nextPageOffset

    return this
  }

  public aggregateStreams(): PagedStreams {
    return {
      streams: this.getConcatenatedStreams(),
      nextPageOffsets: this.getNextPageOffsets()
    }
  }

  private getConcatenatedStreams(): Stream[] {
    return Object
      .values(this.streams)
      .reduce<Stream[]>((allStreams: Stream[], streams: Stream[]) => {
        return allStreams.concat(streams)
    }, [])
  }

  private getNextPageOffsets(): PageOffsets {
    return Object
      .entries(this.pageOffsets)
      .reduce<PageOffsets>((nextPageOffsets: PageOffsets, [streamSource, nextPageOffset]) => {
          return {...nextPageOffsets, [streamSource]: nextPageOffset! }
      }, {})
  }
}