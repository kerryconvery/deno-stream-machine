import { PageOffsets, PageOffset } from "./types/page_offset.ts"
import { PagedStreams } from "./types/stream.ts"
import { StreamAggregator } from "./helpers/stream_aggregator.ts"
import { StreamProvider } from "./types/stream_provider.ts"

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