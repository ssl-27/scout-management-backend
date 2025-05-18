// src/common/interceptors/global-method-logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GlobalMethodLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get instance and handler
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    // Skip built-in NestJS methods to reduce noise
    if (shouldSkipLogging(className, methodName)) {
      return next.handle();
    }

    Logger.debug(`→ ${className}.${methodName}()`);

    return next.handle().pipe(
      tap({
        next: () => {
          Logger.debug(`← ${className}.${methodName}() completed`);
        },
        error: (error) => {
          Logger.error(`⨯ ${className}.${methodName}() failed: ${error.message}`);
        }
      }),
    );
  }
}

// Helper function to skip logging for certain built-in methods
function shouldSkipLogging(className: string, methodName: string): boolean {
  // Skip NestJS internal methods
  if (className.includes('Explorer') && ['explore', 'extractRouterPath'].includes(methodName)) {
    return true;
  }

  // Skip other noisy built-in methods
  const skipMethods = ['canActivate', 'getRequest', 'transform', 'intercept'];
  if (skipMethods.includes(methodName)) {
    return true;
  }

  return false;
}