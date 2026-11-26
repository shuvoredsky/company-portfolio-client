import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { ApiError, ApiErrorResponse } from './types';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
  // Public client API requires no cookies or credentials
  withCredentials: false,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (!axiosError.response) {
        return Promise.reject(
          new ApiError(0, 'Cannot reach the server'),
        );
      }

      const { status, data } = axiosError.response;
      const message =
        data?.message ||
        (status === 429
          ? 'Too many requests. Please try again later.'
          : 'Request failed. Please try again.');
      const errorSources = Array.isArray(data?.errorSources)
        ? data.errorSources
        : [];

      return Promise.reject(new ApiError(status, message, errorSources));
    }

    return Promise.reject(new ApiError(0, 'Cannot reach the server'));
  },
);
