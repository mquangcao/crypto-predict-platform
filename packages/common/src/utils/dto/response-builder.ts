import { ApiResponse } from "./api-response.dto";

type ResponseParams<T> = {
  data: T;
  message?: string;
  statusCode?: number;
};

export class ResponseBuilder {
  static createResponse<T>({
    data,
    message = "Success",
    statusCode = 200,
  }: ResponseParams<T>): ApiResponse<T> {
    return {
      data,
      message,
      statusCode,
    };
  }
}
