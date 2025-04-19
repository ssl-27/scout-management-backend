// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const method = req.method;
      const url = req.url;
      const controller = context.getClass().name;
      const handler = context.getHandler().name;

      Logger.log(`Request: ${method} ${url} - ${controller}.${handler}()`);

      const now = Date.now();
      return next.handle().pipe(
        tap(() => {
          Logger.log(`Response: ${method} ${url} - ${Date.now() - now}ms`);
        }),
      );
    }
    return next.handle();
  }
}