import { assertEquals } from "../../../dev_deps.ts"
import { StreamService, StreamProvider, Stream, PageOffset } from "../stream_service.ts";

Deno.test("Stream service", async (t) => {
  await t.step("returns an empty list of streams when the stream provider has no streams available", async () => {
    const streamProvider = new TestStreamProvider('1', createPagedStreams(0))
    const streamService = new StreamService().registerStreamProvider(streamProvider)

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 0)
  })

  await t.step("includes the stream fields", async () => {
    const expectedStream = { title: 'Stream 1' }
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('1', [expectedStream]))
      .setPageSize(2)

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams[0], expectedStream)
    
  })

  await t.step("returns a list of streams when at least one stream provider has streams available", async () => {
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))
      .setPageSize(2)

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 2)
  })

  await t.step("returns a list of streams from all providers", async () => {
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(2)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(1)))
      .setPageSize(2)

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 3)
  })

  await t.step("returns a paged list of streams from each provider", async () => {
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('2', createPagedStreams(3)))
      .setPageSize(2)

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 4)
  })

  await t.step("returns a next page token for each provider that has more pages", async () => {
    const expectedPageOffsets = { provider1: new PageOffset('1'), provider2: PageOffset.none(), provider3: new PageOffset('2') }
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('provider1', createPagedStreams(1), expectedPageOffsets.provider1))
      .registerStreamProvider(new TestStreamProvider('provider2', createPagedStreams(1)))
      .registerStreamProvider(new TestStreamProvider('provider3', createPagedStreams(1), expectedPageOffsets.provider3))
      .setPageSize(2)
      
    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 3)
    assertEquals(pagedStreams.nextPageOffsets, expectedPageOffsets)
  })

  await t.step("returns the next page of streams from each provider", async () => {
    const streamService = new StreamService()
      .registerStreamProvider(new TestStreamProvider('provider1', createPagedStreams(3)))
      .registerStreamProvider(new TestStreamProvider('provider2', createPagedStreams(2)))
      .registerStreamProvider(new TestStreamProvider('provider3', createPagedStreams(3)))
      .setPageSize(2)
      .setPageOffsets({
        provider1: new PageOffset('1'),
        provider2: new PageOffset('2'),
        provider3: new PageOffset('1')
      })

    const pagedStreams = await streamService.getStreams()

    assertEquals(pagedStreams.streams.length, 2)
  })
})

Deno.test("Page offset", async (t) => {
  await t.step("Returns a string page offset", () => {
    assertEquals(new PageOffset('1').asString(), '1')
  })

  await t.step("Returns a string as a number page offset", () => {
    assertEquals(new PageOffset('1').asNumber(), 1)
  })

  await t.step("Returns page offset as an empty string when not set", () => {
    assertEquals(PageOffset.none().asString(), '')
  })

  await t.step("Returns page offset as the number 0 when not set", () => {
    assertEquals(PageOffset.none().asNumber(), 0)
  })

  await t.step("Returns true when the page offset is none", () => {
    const pageOffset = PageOffset.none()

    assertEquals(pageOffset.isNone, true)
    assertEquals(pageOffset.isSome, false)
  })

  await t.step("Returns true when the page offset is not none", () => {
    const pageOffset = PageOffset.some('1')
 
    assertEquals(pageOffset.isSome, true)
    assertEquals(pageOffset.isNone, false)
  })

  await t.step("Returns zero when the page offset is not a valid number", () => {
    assertEquals(PageOffset.some('a').asNumber(), 0)
  })
})

class TestStreamProvider implements StreamProvider {
  private _streamPlatform: StreamPlatform
  private _providerId: string
  private _streams: Stream[] = []
  private _pageSize: number = 1
  private _pageOffset: PageOffset = PageOffset.none()
  private _nextPageOffset: PageOffset = PageOffset.none()

  constructor(providerId: string, availableStreams: Stream[], nextPageOffset?: PageOffset) {
    this._providerId = providerId
    this._streamPlatform = { availableStreams, nextPageOffset: nextPageOffset ?? PageOffset.none() }
  }
  
  public get id(): string {
      return this._providerId
  }

  public get streams(): Stream[] {
    return this._streams
  }

  public get nextPageOffset(): PageOffset {
    return this._nextPageOffset;
  }

  public readStreams(): Promise<void> {
    this._streams = this._streamPlatform.availableStreams.slice(this._pageOffset.asNumber(), this._pageSize)
    this._nextPageOffset = this._streamPlatform.nextPageOffset
    
    return Promise.resolve()
  }

  public setPageSize(pageSize: number): StreamProvider {
    this._pageSize = pageSize
    return this
  }

  public setPageOffset(pageOffset: PageOffset): StreamProvider {
    this._pageOffset = pageOffset
    return this
  }
}

type StreamPlatform = {
  availableStreams: Stream[]
  nextPageOffset: PageOffset
}

function createPagedStreams(numberOfStreams: number): Stream[] {
  return new Array<Stream>(numberOfStreams).fill({ title: '' }).map((_, index: number) => {
    return {
      title: `Stream ${index + 1}`
    }
  })
}