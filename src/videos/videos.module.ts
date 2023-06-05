import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { BullModule } from '@nestjs/bull';
import { VideosConsumer } from './videos-consumer.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'videos' })],
  controllers: [VideosController],
  providers: [VideosService, VideosConsumer],
})
export class VideosModule {}
