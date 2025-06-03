
// utils/callApi.ts
import axios, { Method, AxiosRequestConfig } from 'axios';

const callApi = async (
  method: Method,
  url: string,
  data: any = null,
  headers: AxiosRequestConfig['headers'] = {}
): Promise<any> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
    };

    // Attach data only if it's not GET or HEAD
    if (method !== 'GET' && method !== 'HEAD') {
      config.data = data;

      // If data is FormData, remove Content-Type so Axios sets the correct one with boundary
      if (data instanceof FormData) {
        delete config.headers?.['Content-Type'];
      }
    }

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message);
    }
  }
};

export default callApi;
