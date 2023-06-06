import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { bundle } from '@remotion/bundler';
import { webpackOverride } from '../video/webpack-override';
import path from 'node:path';
import { ConfigService } from '@nestjs/config';

export let bundleLocation: Awaited<ReturnType<typeof bundle>>;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  bundleLocation = await bundle(
    path.join(process.cwd(), './video/index.ts'),
    () => undefined,
    {
      webpackOverride,
    },
  );

  const port = configService.get('PORT') || 3050;
  await app.listen(port);
  logger.log(`Started server on port ${port}`);
}
bootstrap();
