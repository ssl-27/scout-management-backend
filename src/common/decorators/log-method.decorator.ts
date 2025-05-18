// src/common/decorators/log-method.decorator.ts
import { Logger } from '@nestjs/common';

export function LogMethod() {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Save a reference to the original method
    const originalMethod = descriptor.value;
    // Get the class name
    const className = target.constructor.name;

    // Replace the original method with our wrapped version
    descriptor.value = async function(...args: any[]) {
      Logger.debug(`→ ${className}.${propertyKey}()`);

      try {
        // Call the original method
        const result = await originalMethod.apply(this, args);
        Logger.debug(`← ${className}.${propertyKey}() completed`);
        return result;
      } catch (error) {
        Logger.error(`⨯ ${className}.${propertyKey}() failed: ${error.message}`);
        throw error;
      }
    };

    return descriptor;
  };
}