/* eslint-disable @typescript-eslint/ban-ts-comment */
export class Query<T> {
  private readonly gtxRetriever: () => any;
  private readonly parameters: Map<string, unknown>;

  // @ts-ignore
  private queryName: string = null;

  private constructor(gtxRetriever: () => any) {
    this.gtxRetriever = gtxRetriever;
    this.parameters = new Map<string, unknown>();
  }

  public static init<T>(gtxRetriever: () => any): Query<T> {
    return new Query(gtxRetriever);
  }

  public name(queryName: string): Query<T> {
    this.queryName = queryName;
    return this;
  }

  public getName(): string {
    return this.queryName;
  }

  public addParameter(key: string, value: unknown): Query<T> {
    this.parameters.set(key, value);
    return this;
  }

  public getParameters(): Map<string, unknown> {
    return new Map(this.parameters);
  }

  public async send(): Promise<T> {
    const obj = {};
    // @ts-ignore
    this.parameters.forEach((value: unknown, key: string) => (obj[key] = value));
    const gtx = await this.gtxRetriever();
    return gtx.query(this.queryName, obj);
  }
}
