abstract class Request {
  protected abstract baseURL: string;
  public abstract mockResponse(): Promise<Object>;
  public abstract getEndpoint(): string;
  public abstract get queryParams(): string;
  public abstract get headers(): object;
  public abstract get params(): object;
  protected mockSampleResponse = {
    config: {},
    headers: {},
    request: {},
    statusText: '',
    status: 200,
  };
}

export default Request;
