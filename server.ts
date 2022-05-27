import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { createStreamService } from "./src/factories/stream_service.ts";

const router = new Router();

router
  .get("/streams", async (context) => {
    const streamService = createStreamService()

    context.response.body = await streamService.getStreams()
  });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });