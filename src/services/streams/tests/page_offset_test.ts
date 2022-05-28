import { assertEquals } from "../../../../dev_deps.ts"
import { PageOffset } from "../types/page_offset.ts";

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