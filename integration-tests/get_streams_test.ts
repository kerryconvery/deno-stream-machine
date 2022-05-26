import { assertEquals } from "../dev_deps.ts"

Deno.test("Get Streams", async (t) => {
  const process = Deno.run({
    cmd: ["npm run", "../mock-streaming-services/mocks"]
  });

  await t.step("returns a list of streams", async () => {
    const jsonResponse = await fetch("http://localhost:3100/helix/streams");
    const jsonData = await jsonResponse.json();
    console.log(jsonData);
  })
})