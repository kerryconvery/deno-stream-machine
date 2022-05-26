import { PageOffset, Stream, StreamProvider } from "../../services/stream_service.ts";
import { TwitchKrakenGateway } from "./twitch_kraken_gateway.ts";

type TwitchProviderOptions = {
    defaultPageSize: number
}

export class TwitchProvider implements StreamProvider {

    private pageSize: number
    constructor(options: TwitchProviderOptions) {
        this.pageSize = options.defaultPageSize
    }
    get id(): string {
        return "twitch"
    }
    get streams(): Stream[] {
        return [{},{},{}]
    }
    get nextPageOffset(): PageOffset {
        throw new Error("Method not implemented.");
    }
    
    setPageSize(pageSize: number): StreamProvider {
        this.pageSize = pageSize
        return this
    }
    
    setPageOffset(pageOffset: PageOffset): StreamProvider {
        throw new Error("Method not implemented.");
    }

    readStreams(): StreamProvider {
        return this
    }
}