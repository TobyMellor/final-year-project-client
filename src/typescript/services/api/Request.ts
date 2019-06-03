abstract class Request {
  protected baseURL: string;
  public abstract mockResponse(): Promise<Object>;
  public abstract getEndpoint(): string;

  public get queryParams(): string {
    return '';
  }

  public get headers(): object {
    return {};
  }

  public getParams(): Object {
    return {};
  }
}

export default Request;
