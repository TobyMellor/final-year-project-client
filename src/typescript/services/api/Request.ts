abstract class Request {
  public abstract mockResponse(): Promise<Object>;
  public abstract getEndpoint(): string;

  public getParams(): Object {
    return {};
  }
}

export default Request;
