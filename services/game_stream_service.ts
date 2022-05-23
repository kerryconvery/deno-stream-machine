
export type Stream = {

}

export class PageOffset {
  private value?: string
  
  constructor(value?: string | number) {
    this.value = value as string
  }

  public static some(value: string | number): PageOffset {
    return new PageOffset(value)
  }

  public static none(): PageOffset {
    return new PageOffset()
  }

  public asString(): string {
    return this.value ?? ''
  }

  public asNumber(): number {
    return this.value ? parseInt(this.value) : 0
  }

  public get isSome(): boolean {
    return !this.isNone
  }

  public get isNone(): boolean {
    return this.value === undefined
  }
}

export type ProviderPageOffsets = {
  [key: string]: PageOffset
}

export type PagedStreams = {
  streams: Stream[],
  nextPageOffsets: ProviderPageOffsets
}

export interface GameStreamProvider {
  get id(): string
  get streams(): Stream[]
  get nextPageOffset(): PageOffset

  setPageSize(pageSize: number): void
  setPageOffset(pageOffset: PageOffset): void
  readStreams(): void
}

export class GameStreamService {
  private streamProviders: GameStreamProvider[] = []
  private pageSize: number = 1
  private pageOffsets: ProviderPageOffsets = {}

  public registerStreamProvider(provider: GameStreamProvider): GameStreamService {
    this.streamProviders.push(provider)

    return this
  }

  public getStreams(): PagedStreams {
    const streamAggregator = new StreamAggregator()

    this.streamProviders.forEach((provider) => {
      provider.setPageSize(this.pageSize)
      provider.setPageOffset(this.getPageOffset(provider.id))
      provider.readStreams()

      streamAggregator.addStreams(provider.id, provider.streams, provider.nextPageOffset)
    })

    return streamAggregator.aggregateStreams()
  }

  private getPageOffset(providerId: string): PageOffset {
    return this.pageOffsets[providerId] ?? PageOffset.none()
  }
  public setPageSize(pageSize: number): GameStreamService {
    this.pageSize = pageSize;
    return this;
  }

  public setPageOffsets(pageOffsets: ProviderPageOffsets): GameStreamService {
    this.pageOffsets = pageOffsets
    return this;
  }
}

class StreamAggregator {
  private providerStreams: Record<string, Stream[]> = {}
  private providerPageOffsets: Record<string, PageOffset> = {}
  
  public addStreams(providerId: string, streams: Stream[], nextPageOffset: PageOffset): StreamAggregator {
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
      .reduce<ProviderPageOffsets>((nextPageOffsets: ProviderPageOffsets, [providerId, nextPageOffset]) => {
          return {...nextPageOffsets, [providerId]: nextPageOffset! }
      }, {})
  }
}