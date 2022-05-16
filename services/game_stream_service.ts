
export class Stream {

}

export interface GameStreamProvider {
  getStreams(): Stream[]
}

export class GameStreamService {
  private streamProviders: GameStreamProvider[] = []

  registerStreamProvider(provider: GameStreamProvider): GameStreamService {
    this.streamProviders.push(provider)

    return this
  }

  getStreams(): Stream[] {
    return this.streamProviders.reduce<Stream[]>((allStreams, provider) => {
      return allStreams.concat(provider.getStreams())
    }, [])
  }
}