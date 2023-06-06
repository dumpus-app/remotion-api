import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'node:fs';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { fileExists, getFilePath } from './utils';
import { JobParams, jobParams } from './videos-consumer.service';
import { Observable, map } from 'rxjs';
import EventEmitter from 'node:events';

class MyEmitter extends EventEmitter {
  emit(type: string, ...args: any[]) {
    super.emit('*', ...[type, ...args]);
    return super.emit(type, ...args) || super.emit('', ...args);
  }
}

@Injectable()
export class VideosService {
  private logger = new Logger(`VideosService`);

  // @ts-expect-error ts(1239)
  constructor(@InjectQueue('videos') private videosQueue: Queue) {}

  async create(createVideoDto: CreateVideoDto) {
    const id = uuidv4();
    this.logger.log(`Add ${id} to videosQueue`);
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
    const obs$ = new Observable<string>((observer) => {
      this.videosQueue.emit = MyEmitter.prototype.emit;
      this.videosQueue.on('*', (type: string, job: Job<JobParams>) => {
        if (job.data.id === id) {
          observer.next(type);
        }
        if (type === 'completed') {
          this.videosQueue.removeAllListeners();
        }
      });
    });
    return obs$.pipe(
      map((observer) => ({
        data: {
          status: observer,
        },
      })),
    );
  }
}
