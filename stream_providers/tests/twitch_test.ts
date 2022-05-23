import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { Twitch } from "../twitch.ts";

Deno.test("Twitch", async (t) => {
  await t.step("Returns the provider id", () => {
    assertEquals(new Twitch().id, "twitch")
  })
})