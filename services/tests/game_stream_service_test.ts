import { assertEquals } from "../../dev_deps.ts"
import { GameStreamService, GameStreamProvider, PagedStreams, Stream, GameStreamProviderOptions } from "../game_stream_service.ts";

Deno.test("Game stream service", async (t) => {
  await t.step("returns an empty list of game streams when the stream provider has no streams available", () => {
    const streamProvider = new TestStreamProvider('1', createPagedStreams(0))
    const streamService = new GameStreamService().registerStreamProvider(streamProvider)

    const pagedStreams = streamService.getStreams({ pageSize: 1 })

    assertEquals(pagedStreams.streams.length, 0)
  })

  await t.step("returns a list of game streams when at least one stream provider has streams available", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))

    const pagedStreams = streamService.getStreams({ pageSize: 2 })

    assertEquals(pagedStreams.streams.length, 2)
  })

  await t.step("returns a list of game streams from all providers", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(1)))

    const pagedStreams = streamService.getStreams({ pageSize: 2 })

    assertEquals(pagedStreams.streams.length, 3)
  })

  await t.step("returns a paged list of streams from each provider", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(3)))

    const pagedStreams = streamService.getStreams({ pageSize: 2 })

    assertEquals(pagedStreams.streams.length, 4)
  })

  await t.step("returns a next page token for each provider that has more pages", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('provider1', createPagedStreams(1), '1'))
      .registerStreamProvider(new TestStreamProvider('provider2', createPagedStreams(1)))
      .registerStreamProvider(new TestStreamProvider('provider3', createPagedStreams(1), '3'))
      

    const pagedStreams = streamService.getStreams({ pageSize: 2 })

    assertEquals(pagedStreams, {
      streams: [{}, {}, {}],
      nextPageOffsets: { provider1: '1', provider3: '3' }
    })
  })

  await t.step("returns the next page of streams from each provider", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('provider1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('provider2', createPagedStreams(2)))
      .registerStreamProvider(new TestStreamProvider('provider3', createPagedStreams(3)))
      
    const pagedStreams = streamService.getStreams({
      pageSize: 2,
      pageOffsets: { provider1: '1', provider2: '2', provider3: '1' }
    })

    assertEquals(pagedStreams.streams.length, 2)
  })
})

class TestStreamProvider implements GameStreamProvider {
  private _streamPlatform: StreamPlatform
  private _providerId: string
  private _streams: Stream[] = []
  private _pageSize: number = 1
  private _pageOffset?: string
  private _nextPageOffset?: string

  constructor(providerId: string, availableStreams: Stream[], nextPageOffset?: string) {
    this._providerId = providerId
    this._streamPlatform = { availableStreams, nextPageOffset }
  }
  
  public get id(): string {
      return this._providerId
  }

  public get streams(): Stream[] {
    return this._streams
  }

  public get nextPageOffset(): string | undefined {
    return this._nextPageOffset;
  }

  public readStreams(): void {
    const pageStartPosition = this.getPageStartPosition(this._pageOffset)

    this._streams = this._streamPlatform.availableStreams.slice(pageStartPosition, this._pageSize)
    this._nextPageOffset = this._streamPlatform.nextPageOffset
  }

  private getPageStartPosition(nextPageOffset?: string): number {
    return nextPageOffset ? parseInt(nextPageOffset) : 0
  }

  public setPageSize(pageSize: number): void {
    this._pageSize = pageSize
  }

  public setPageOffset(pageOffset?: string): void {
    this._pageOffset = pageOffset
  }
}

type StreamPlatform = {
  availableStreams: Stream[]
  nextPageOffset?: string
}

function createPagedStreams(numberOfStreams: number): Stream[] {
  return new Array<Stream>(numberOfStreams).fill({})
}