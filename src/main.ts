import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { bundle } from '@remotion/bundler';
import { webpackOverride } from '../video/webpack-override';
import path from 'node:path';

export let bundleLocation: Awaited<ReturnType<typeof bundle>>;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  bundleLocation = await bundle(
    path.join(process.cwd(), './video/index.ts'),
    () => undefined,
    {
      webpackOverride,
    },
  );
  await app.listen(3000);
}
bootstrap();
