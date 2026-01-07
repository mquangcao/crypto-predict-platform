import { HttpException, HttpExceptionOptions } from "@nestjs/common";

export class GatewayException extends HttpException {
  constructor(
    message: string,
    code: string = "BADGATEWAY",
    options?: HttpExceptionOptions
  ) {
    const response = {
      message,
      code,
    };
    super(response, 502, options);
  }
}
