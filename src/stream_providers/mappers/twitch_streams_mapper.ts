import { Stream } from "../../services/stream_service.ts"
import { TwitchStreams } from "../gateways/twitch_helix_gateway.ts"

export class TwitchStreamsMapper {
  public map(twitchStreams: TwitchStreams): Stream[] {
    return twitchStreams.data.map((stream) => {
      return {
        title: stream.title
      }
    })
  }
}