import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { CommandsModule } from './commands/commands.module';

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();