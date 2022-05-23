import { PageOffset, Stream, StreamProvider } from "../services/stream_service.ts";

export class Twitch implements StreamProvider {
  get id(): string {
      return "twitch"
  }
  get streams(): Stream[] {
      throw new Error("Method not implemented.");
  }
  get nextPageOffset(): PageOffset {
      throw new Error("Method not implemented.");
  }
  setPageSize(pageSize: number): void {
      throw new Error("Method not implemented.");
  }
  setPageOffset(pageOffset: PageOffset): void {
    throw new Error("Method not implemented.");
  }
  readStreams(): void {
      throw new Error("Method not implemented.");
  }
}