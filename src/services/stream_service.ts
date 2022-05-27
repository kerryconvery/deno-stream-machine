
export type Stream = {
  title: string
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
    return this.value ? this.tryParseInt(this.value, 0) : 0
  }

  private tryParseInt(value: string, defaultValue: number): number {
    const parsedValue = parseInt(value)

    return isNaN(parsedValue) ? defaultValue : parsedValue
  }
  
  public get isSome(): boolean {
    return !this.isNone
  }

  public get isNone(): boolean {
    return this.value === undefined
  }
}

export type PageOffsets = {
  [key: string]: PageOffset
}

export type PagedStreams = {
  streams: Stream[],
  nextPageOffsets: PageOffsets
}

export interface StreamProvider {
  get id(): string
  get streams(): Stream[]
  get nextPageOffset(): PageOffset

  setPageSize(pageSize: number): StreamProvider
  setPageOffset(pageOffset: PageOffset): StreamProvider
  readStreams(): Promise<void>
}

export class StreamService {
  private streamProviders: StreamProvider[] = []
  private pageSize: number = 1
  private pageOffsets: PageOffsets = {}
  private streamAggregator: StreamAggregator = new StreamAggregator()

  public registerStreamProvider(provider: StreamProvider): StreamService {
    this.streamProviders.push(provider)

    return this
  }

  public async getStreams(): Promise<PagedStreams> {
    const tasks = this.streamProviders.map(provider => this.collectStreams(provider))

    await Promise.all(tasks)

    return this.streamAggregator.aggregateStreams()
  }

  private async collectStreams(provider: StreamProvider): Promise<void> {
    provider.setPageSize(this.pageSize)
    provider.setPageOffset(this.getPageOffset(provider.id))

    return provider.readStreams().then(() => {
      this.streamAggregator.addStreams(
        provider.id,
        provider.streams,
        provider.nextPageOffset
      )
    })
  }

  private getPageOffset(providerId: string): PageOffset {
    return this.pageOffsets[providerId] ?? PageOffset.none()
  }

  public setPageSize(pageSize: number): StreamService {
    this.pageSize = pageSize;
    return this;
  }

  public setPageOffsets(pageOffsets: PageOffsets): StreamService {
    this.pageOffsets = pageOffsets
    return this;
  }
}

class StreamAggregator {
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