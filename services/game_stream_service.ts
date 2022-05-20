
export type Stream = {

}

export type PagedStreams = {
  streams: Stream[],
  nextPageToken?: string
}

export type GameStreamProviderOptions = {
  pageSize: number,
  pageSkip: number
}

export interface GameStreamProvider {
  get id(): string
  getStreams(options: GameStreamProviderOptions): PagedStreams,
}

export type GameStreamServiceOptions = {
  pageSize: number,
  pageSkip: number
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
      streamAggregator.addStreams(
        provider.id,
        provider.getStreams({ pageSize: options.pageSize, pageSkip: options.pageSkip })
      )
    })

    return streamAggregator.aggregateStreams()
  }
}

class StreamAggregator {
  private providerStreams: Record<string, PagedStreams> = {}
  
  public addStreams(providerId: string, streams: PagedStreams): StreamAggregator {
    this.providerStreams[providerId] = streams

    return this
  }

  public aggregateStreams(): PagedStreams {
    return {
      streams: this.getConcatenatedStreams(),
      nextPageToken: this.getConcatenatedNextPageToken()
    }
  }

  private getConcatenatedStreams(): Stream[] {
    return Object
      .values(this.providerStreams)
      .reduce<Stream[]>((allStreams: Stream[], pagedStreams: PagedStreams) => {
        return allStreams.concat(pagedStreams.streams)
    }, [])
  }

  private getConcatenatedNextPageToken(): string {
    return Object
      .entries(this.providerStreams)
      .filter(([_, streams]) => {
        return streams.nextPageToken !== undefined
      })
      .reduce<string[]>((concatenatedNextPageToken: string[], [providerId, pagedStreams]) => {
          return [...concatenatedNextPageToken, `${providerId}:${pagedStreams.nextPageToken}`]
    }, [])
    .join(',')
  }
}