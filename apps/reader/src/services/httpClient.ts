import axios from 'axios';
import axiosRetry from 'axios-retry';

const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_LEONARDO_AI_ENDPOINT,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_LEONARDO_AI_KEY}`, 
    'Content-Type': 'application/json',
    Accept: '*/*'
  },
  timeout: 60000,
}

export const api = axios.create(apiConfig);

axiosRetry(api, { retries: 2 });
axiosRetry(api, { retryDelay: (retryCount) => {
  return retryCount * 1000;
}});

api.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause the error
    // if (response.data?.generations_by_pk?.status === "PENDING") {
    //   response.status = 500;
    //   throw response;
    // }

    return response;
  },
  function (error) {
    console.log('intercepted error: ', error);
    return error;
  }
);