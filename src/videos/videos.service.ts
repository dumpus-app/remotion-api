import { Injectable, StreamableFile } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'node:fs';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { fileExists, getFilePath } from './utils';
import { JobParams, jobParams } from './videos-consumer.service';
import { Observable, map } from 'rxjs';

@Injectable()
export class VideosService {
  // @ts-expect-error ts(1239)
  constructor(@InjectQueue('videos') private videosQueue: Queue) {}

  async create(createVideoDto: CreateVideoDto) {
    const id = uuidv4();
    this.videosQueue.add(jobParams({ id, ...createVideoDto }));
    return { id };
  }

  async findOne(id: string) {
    const filePath = getFilePath(id);

    const valid = await fileExists(filePath);
    if (!valid) return false;

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  async sse(id: string) {
    // TODO: make this work
    // 1. Test with manual values and sleeps
    // 2. Test event listeners with console logs
    // 3. Implement actual solution
    const obs$: Observable<'active' | 'progress' | 'completed'> =
      new Observable((observer) => {
        this.videosQueue.on('active', (job: Job<JobParams>) => {
          if (job.data.id === id) {
            observer.next('active');
          }
        });
        this.videosQueue.on('progress', (job: Job<JobParams>) => {
          if (job.data.id === id) {
            observer.next('progress');
          }
        });
        this.videosQueue.on('completed', (job: Job<JobParams>) => {
          if (job.data.id === id) {
            observer.next('completed');
            this.videosQueue.removeAllListeners();
          }
        });
      });
    return obs$.pipe(map((observer) => ({ status: observer })));
  }
}
