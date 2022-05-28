import { Stream } from "../../../services/streams/types/stream.ts"
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