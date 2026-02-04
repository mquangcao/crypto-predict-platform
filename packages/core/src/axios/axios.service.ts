import * as https from 'https';

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as crypto from 'crypto';

import { getConfig } from '@app/common';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AxiosService {
  private axiosInstance: AxiosInstance;
  private readonly logger = new Logger(AxiosService.name);

  constructor() {
    const timeout = getConfig('core.axios.timeout');
    const disableSslVerification = getConfig('core.axios.disableSslVerification', false);

    this.axiosInstance = axios.create({
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: disableSslVerification
        ? new https.Agent({
            rejectUnauthorized: false,
            secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          })
        : undefined,
    });
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, config);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getCustom<T>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, config);
      return response;
    } catch (err) {
      return err.response ?? err;
    }
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data, config);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async postCustom<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data, config);
      return response;
    } catch (err) {
      return err.response ?? err;
    }
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, data, config);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async putCustom<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, data, config);
      return response;
    } catch (err) {
      return err.response ?? err;
    }
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(endpoint, config);
      return response.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(error: any) {
    this.logger.error('Axios error: ', error.response?.data || error.message || error);
    throw new BadRequestException(error.response?.data || error.message || 'Unknown error');
  }
}
