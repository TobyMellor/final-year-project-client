import axios from 'axios';
import config from '../../config';
import Request from './Request';

abstract class API {
  protected abstract baseURL: string;

  public static async get(
    request: Request,
    errorFn?: (response: Object) => unknown,
  ) {
    if (config.mock.shouldMockAPIResponses) {
      return request.mockResponse();
    }
    return axios.get(request.getEndpoint(), request.params)
      .catch(errorFn || defaultErrorFn);
  }
}

function defaultErrorFn(response: any) {
  console.error(response);
}

export default API;
