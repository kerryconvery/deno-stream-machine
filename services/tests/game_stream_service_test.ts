import { assertEquals } from "../../dev_deps.ts"
import { GameStreamService, GameStreamProvider, Stream } from "../game_stream_service.ts";

Deno.test("Game stream service", async (t) => {
  await t.step("returns an empty list of game streams when the stream provider has no streams available", () => {
    const streamProvider = new TestStreamProvider([])
    const streamService = new GameStreamService().registerStreamProvider(streamProvider)

    assertEquals(streamService.getStreams().length, 0)
  })

  await t.step("returns a list of game streams when the stream provider has streams available", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider([{}, {}]))

    assertEquals(streamService.getStreams().length, 2)
  })

  await t.step("returns a list of game streams from all providers", () => {
    const streamService = new GameStreamService()
      .registerStreamProvider(new TestStreamProvider([{}, {}]))
      .registerStreamProvider(new TestStreamProvider([{}]))

    assertEquals(streamService.getStreams().length, 3)
  })
})

class TestStreamProvider implements GameStreamProvider {
  private streams: Stream[]
  constructor(streams: Stream[]) {
    this.streams = streams
  }

  getStreams(): Stream[] {
    return this.streams
  }
}