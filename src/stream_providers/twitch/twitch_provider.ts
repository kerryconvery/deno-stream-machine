import { PageOffset, Stream, StreamProvider } from "../../services/stream_service.ts";
import { TwitchHelixGateway } from "../gateways/twitch_helix_gateway.ts";
import { TwitchStreamsMapper } from "../mappers/twitch_streams_mapper.ts";

type TwitchProviderOptions = {
    defaultPageSize: number,
    gateway: TwitchHelixGateway
}

export class TwitchProvider implements StreamProvider {

    private pageSize: number
    private gateway: TwitchHelixGateway
    private _streams: Stream[] = []

    constructor(options: TwitchProviderOptions) {
        this.gateway = options.gateway
        this.pageSize = options.defaultPageSize
    }

    get id(): string {
        return "twitch"
    }
    get streams(): Stream[] {
        return this._streams
    }
    get nextPageOffset(): PageOffset {
        return PageOffset.none()
    }
    
    public setPageSize(pageSize: number): StreamProvider {
        this.pageSize = pageSize
        return this
    }
    
    public setPageOffset(pageOffset: PageOffset): StreamProvider {
        return this
    }

    public async readStreams(): Promise<void> {
        const twitchStreams = await this.gateway.getStreams()

        this._streams = new TwitchStreamsMapper().map(twitchStreams)
    }
}