import { assertEquals } from "../../dev_deps.ts"
import { GameStreamService, GameStreamProvider, PagedStreams, Stream, GameStreamProviderOptions } from "../game_stream_service.ts";

Deno.test("Game stream service", async (t) => {
  await t.step("returns an empty list of game streams when the stream provider has no streams available", () => {
    const streamProvider = new TestStreamProvider('1', createPagedStreams(0))
    const streamService = new GameStreamService().registerStreamProvider(streamProvider)

    const pagedStreams = streamService.getStreams({ pageSize: 1, pageSkip: 0 })

    assertEquals(pagedStreams.streams.length, 0)
  })

  await t.step("returns a list of game streams when at least one stream provider has streams available", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))

    const pagedStreams = streamService.getStreams({ pageSize: 2, pageSkip: 0 })

    assertEquals(pagedStreams.streams.length, 2)
  })

  await t.step("returns a list of game streams from all providers", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(1)))

    const pagedStreams = streamService.getStreams({ pageSize: 2, pageSkip: 0 })

    assertEquals(pagedStreams.streams.length, 3)
  })

  await t.step("returns a paged list of streams from each provider", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(3)))

    const pagedStreams = streamService.getStreams({ pageSize: 2, pageSkip: 0 })

    assertEquals(pagedStreams.streams.length, 4)
  })
  await t.step("returns paged list of streams from each provider starting from a page offset", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(3)))

    const pagedStreams = streamService.getStreams({ pageSize: 2, pageSkip: 1 })

    assertEquals(pagedStreams.streams.length, 2)
  })
  await t.step("returns a next page token for each provider that has more pages", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(1), 'pageToken1'))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(1)))
      .registerStreamProvider(new TestStreamProvider('3', createPagedStreams(1), 'pageToken3'))
      

    const pagedStreams = streamService.getStreams({ pageSize: 2, pageSkip: 0 })

    assertEquals(pagedStreams, {
      streams: [{}, {}, {}],
      nextPageToken: '1:pageToken1,3:pageToken3'
    })
  })

})

class TestStreamProvider implements GameStreamProvider {
  private providerId: string
  private pagedStreams: PagedStreams
  private nextPageToken?: string

  constructor(providerId: string, pagedStreams: PagedStreams, nextPageToken?: string) {
    this.pagedStreams = pagedStreams
    this.nextPageToken = nextPageToken
    this.providerId = providerId
  }
  public get id(): string {
      return this.providerId
  }

  getStreams(options: GameStreamProviderOptions): PagedStreams {
    return {
      streams: this.pagedStreams.streams.slice(options.pageSkip, options.pageSize),
      nextPageToken: this.nextPageToken
    }
  }
}

function createPagedStreams(numberOfStreams: number): PagedStreams {
  const streams = new Array<Stream>(numberOfStreams).fill({})

  return {
    streams,
  }
}