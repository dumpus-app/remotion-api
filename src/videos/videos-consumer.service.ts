import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { CreateVideoDto } from './dto/create-video.dto';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { getFilePath } from './utils';
import { bundleLocation } from '../main';
import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import fsp from 'node:fs/promises';

export type JobParams = CreateVideoDto & { id: string };

export function jobParams(params: JobParams) {
  return params;
}

@Processor('videos')
@Injectable()
export class VideosConsumer {
  private logger = new Logger(`VideosConsumer`);

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  private duration = 60 * 1000 * 15; // 15min

  @Process()
  async transcode(job: Job<JobParams>) {
    const { id, ...inputProps } = job.data;
    this.logger.log(`Start job for id ${id}`);
    // The composition you want to render
    const compositionId = 'Video';
    // Extract all the compositions you have defined in your project
    // from the webpack bundle.
    const comps = await getCompositions(bundleLocation, {
      // You can pass custom input props that you can retrieve using getInputProps()
      // in the composition list. Use this if you want to dynamically set the duration or
      // dimensions of the video.
      inputProps,
    });
    // Select the composition you want to render.
    const composition = comps.find((c) => c.id === compositionId);
    // Ensure the composition exists
    if (!composition) {
      throw new Error(`No composition with the ID ${compositionId} found.`);
    }

    const outputLocation = getFilePath(id);
    this.logger.log(`Start ${outputLocation} rendering`);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
    });
    this.logger.log('Render done');
    return {};
  }

  @OnQueueCompleted()
  onCompleted(
    job: Job<JobParams>,
    result: Awaited<ReturnType<typeof this.transcode>>,
  ) {
    const { id } = job.data;
    this.schedulerRegistry.addTimeout(
      `delete-video-${id}`,
      setTimeout(async () => {
        await fsp.unlink(getFilePath(id));
        this.logger.log(`Deleted video with id ${id}`);
      }, this.duration),
    );
  }
}
