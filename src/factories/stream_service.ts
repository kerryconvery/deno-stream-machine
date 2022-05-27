import { StreamService } from "../services/stream_service.ts";
import { TwitchHelixGateway } from "../stream_providers/gateways/twitch_helix_gateway.ts";
import { TwitchProvider } from "../stream_providers/twitch/twitch_provider.ts"

const twitchGatewayUrl = "http://localhost:3100"

export function createStreamService(): StreamService {
  return new StreamService()
    .registerStreamProvider(new TwitchProvider({
      gateway: new TwitchHelixGateway({ apiUrl: twitchGatewayUrl }),
      defaultPageSize: 10
    }))
}