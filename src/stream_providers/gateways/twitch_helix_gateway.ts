
export type TwitchStream = {
  title: string
}

export type TwitchStreams = {
  data: TwitchStream[]
}

export type TwitchHelixGatewayOptions = {
  apiUrl: string,
}

export class TwitchHelixGateway {
  private apiUrl: string

  constructor(options: TwitchHelixGatewayOptions) {
    this.apiUrl = options.apiUrl
  }

  public getStreams(): Promise<TwitchStreams> {
    return fetch(`${this.apiUrl}/helix/streams`)
      .then(res => res.json())
      .then(data => data as TwitchStreams)
  }
}