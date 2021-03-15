export class Query<T> {
  private readonly gtx: Promise<any>;
  private readonly parameters: Map<string, unknown>;

  // @ts-ignore
  private queryName: string = null;

  private constructor(gtx: Promise<any>) {
    this.gtx = gtx;
    this.parameters = new Map<string, unknown>();
  }

  public static init<T>(gtx: any): Query<T> {
    return new Query(gtx);
  };

  public name(queryName: string): Query<T> {
    this.queryName = queryName;
    return this;
  }

  public addParameter(key: string, value: unknown): Query<T> {
    this.parameters.set(key, value);
    return this;
  }

  public send(): Promise<T> {
    const obj = {};
    // @ts-ignore
    this.parameters.forEach((value: unknown, key: string) => obj[key] = value);
    return this.gtx.then(client => client.query(this.queryName, obj));
  }

}
