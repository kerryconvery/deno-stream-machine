import { assertEquals } from "../dev_deps.ts"

Deno.test("Get Streams", async (t) => {
  const streamMachineUrl: string = "http://localhost:8000/streams"

  await t.step("returns a list of streams from twitch", async () => {
    const data = await fetch(streamMachineUrl).then(res => res.json())

    assertEquals(data.streams.length, 2)
    assertEquals(data.streams[0].title, 'hablamos y le damos a Little Nightmares 1')
    assertEquals(data.streams[0].thumbnail, 'https://little-nightmares.jpg')
    assertEquals(data.streams[1].title, 'Dota finals')
    assertEquals(data.streams[1].thumbnail, 'https://dota-finals.jpg')
  })
})