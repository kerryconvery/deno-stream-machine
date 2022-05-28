export class PageOffset {
  private value?: string
  
  constructor(value?: string | number) {
    this.value = value as string
  }

  public static some(value: string | number): PageOffset {
    return new PageOffset(value)
  }

  public static none(): PageOffset {
    return new PageOffset()
  }

  public asString(): string {
    return this.value ?? ''
  }

  public asNumber(): number {
    return this.value ? this.tryParseInt(this.value, 0) : 0
  }

  private tryParseInt(value: string, defaultValue: number): number {
    const parsedValue = parseInt(value)

    return isNaN(parsedValue) ? defaultValue : parsedValue
  }
  
  public get isSome(): boolean {
    return !this.isNone
  }

  public get isNone(): boolean {
    return this.value === undefined
  }
}

export type PageOffsets = {
  [key: string]: PageOffset
}
