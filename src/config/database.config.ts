import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const environment = configService.get('NODE_ENV') || 'development';

  const config = {
    type: 'postgres' as const,
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  };

  console.log('Database config:', {
    ...config,
    password: '***' // Hide password in logs
  });

  switch (environment) {
    case 'development':
      return {
        ...config,
        logging: true,
        logger: 'advanced-console', // Use TypeORM's built-in logger
      };
    case 'production':
      return {
        ...config,
        synchronize: false,
      };
    default:
      return config;
  }
};