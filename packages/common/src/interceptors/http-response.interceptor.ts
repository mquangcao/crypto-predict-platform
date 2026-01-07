import { Observable, map } from "rxjs";

import { ApiResponse } from "../utils";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (!data?.data && !data?.message && !data?.error && !data?.populated) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            data: data,
            message: "Success",
            meta: undefined,
            populated: undefined,
          };
        }

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data?.message || "Success",
          data: data?.data ?? null,
          meta: data?.meta || undefined,
          populated: data?.populated || undefined,
        };
      })
    );
  }
}
