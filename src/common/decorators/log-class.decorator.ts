// src/common/decorators/log-class.decorator.ts
import { Logger } from '@nestjs/common';

export function LogClass() {
  return function(target: any) {
    // Get all methods of the class
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      prop => typeof target.prototype[prop] === 'function' && prop !== 'constructor'
    );

    // Loop through each method
    for (const methodName of methodNames) {
      const originalMethod = target.prototype[methodName];

      // Replace the method with our wrapped version
      target.prototype[methodName] = async function(...args: any[]) {
        Logger.debug(`→ ${target.name}.${methodName}()`);

        try {
          const result = await originalMethod.apply(this, args);
          Logger.debug(`← ${target.name}.${methodName}() completed`);
          return result;
        } catch (error) {
          Logger.error(`⨯ ${target.name}.${methodName}() failed: ${error.message}`);
          throw error;
        }
      };
    }
  };
}