import { Stream } from "../../../services/streams/types/stream.ts"
import { TwitchStreams } from "../gateways/types/stream.ts"

export class TwitchStreamsMapper {
  public map(twitchStreams: TwitchStreams): Stream[] {
    return twitchStreams.data.map((stream) => {
      return {
        title: stream.title,
        thumbnail: stream.thumbnail_url
      }
    })
  }
}