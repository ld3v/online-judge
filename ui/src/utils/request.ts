import { extend } from 'umi-request';
import type { RequestMethod, ResponseError } from 'umi-request';
import { MAINTENANCE_PATH } from './constants';
import { history } from 'umi';

const errorHandler: (error: ResponseError) => void = function (error: ResponseError) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(
      'Error with response when handle your request:',
      error.response.status,
      error.data,
    );
    if (error.response.status === 314) {
      localStorage.setItem(`${LC_STR_PREFIX}MAINTENANCE`, error.data.message);
      if (![MAINTENANCE_PATH, `${MAINTENANCE_PATH}/`].includes(window.location.pathname)) {
        history.push(MAINTENANCE_PATH);
      }
      return {
        isError: true,
        message: 'Server is under maintenance mode!',
      };
    }
    if (error.response.status === 404) {
      return {
        isError: true,
        message: 'Maybe we miss some feature, contact to admin with your error for more info!',
      };
    }
    if (error.response.status === 401) {
      window.location.href = "/";
      return {
        isError: true,
        message: 'You need to login to continue!',
      }
    }
    return {
      isError: true,
      messageId: error.data.msg,
      errorData: error.data.data,
    };
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error('Error without response when handle your request [No response]:', error.message);
    return {
      isError: true,
      message: "Your request can't handle because server not responded!",
      notify: error.message === 'Failed to fetch' ? 'system.connect.unavailable' : '',
    };
  }
  // The request was made but no response was received or error occurs when setting up the request.
  console.error('Error without response when handle your request:', error);
  return {
    isError: true,
    message: 'Happened unknown error when handled your request!',
  };
};

const request: RequestMethod = extend({
  prefix: API_URL,
  timeout: 10000,
  errorHandler,
});

// Send with bearer token if exist
request.interceptors.request.use((url: string, options: any) => {
  const authToken = localStorage.getItem(`${LC_STR_PREFIX}AUTH`);
  const headers: Record<string, any> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return {
    url: `${url}`,
    options: {
      ...options,
      headers,
    },
  };
});

export default request;
