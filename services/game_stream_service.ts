
export type Stream = {

}
export type ProviderPageOffsets = {
  [key: string]: string
}

export type PagedStreams = {
  streams: Stream[],
  nextPageOffsets?: ProviderPageOffsets
}

export type GameStreamProviderOptions = {
  pageSize: number,
  pageOffset?: string
}

export interface GameStreamProvider {
  get id(): string
  get streams(): Stream[]
  get nextPageOffset(): string | undefined

  setPageSize(pageSize: number): void
  setPageOffset(pageOffset?: string): void
  readStreams(): void

}

export type GameStreamServiceOptions = {
  pageSize: number
  pageOffsets?: ProviderPageOffsets
}

export class GameStreamService {
  private streamProviders: GameStreamProvider[] = []

  registerStreamProvider(provider: GameStreamProvider): GameStreamService {
    this.streamProviders.push(provider)

    return this
  }

  getStreams(options: GameStreamServiceOptions): PagedStreams {
    const streamAggregator = new StreamAggregator()

    this.streamProviders.forEach((provider) => {
      provider.setPageSize(options.pageSize)
      provider.setPageOffset(options.pageOffsets?.[provider.id])
      provider.readStreams()

      streamAggregator.addStreams(provider.id, provider.streams, provider.nextPageOffset)
    })

    return streamAggregator.aggregateStreams()
  }
}

class StreamAggregator {
  private providerStreams: Record<string, Stream[]> = {}
  private providerPageOffsets: Record<string, string | undefined> = {}
  
  public addStreams(providerId: string, streams: Stream[], nextPageOffset?: string): StreamAggregator {
    this.providerStreams[providerId] = streams
    this.providerPageOffsets[providerId] = nextPageOffset

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
      .values(this.providerStreams)
      .reduce<Stream[]>((allStreams: Stream[], providerStreams: Stream[]) => {
        return allStreams.concat(providerStreams)
    }, [])
  }

  private getNextPageOffsets(): ProviderPageOffsets {
    return Object
      .entries(this.providerPageOffsets)
      .filter(([_, nextPageOffset]) => {
        return nextPageOffset !== undefined
      })
      .reduce<ProviderPageOffsets>((nextPageOffsets: ProviderPageOffsets, [providerId, nextPageOffset]) => {
          return {...nextPageOffsets, [providerId]: nextPageOffset! }
      }, {})
  }
}