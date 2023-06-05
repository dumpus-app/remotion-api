import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { CreateVideoDto } from './dto/create-video.dto';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { webpackOverride } from '../../video/webpack-override';
import path from 'node:path';
import { getFilePath } from './utils';

export type JobParams = CreateVideoDto & { id: string };

export function jobParams(params: JobParams) {
  return params;
}

@Processor('videos')
export class VideosConsumer {
  @Process()
  async transcode(job: Job<JobParams>) {
    const { id, ...inputProps } = job.data;
    // The composition you want to render
    const compositionId = 'Video';
    // You only have to do this once, you can reuse the bundle.
    const entry = './video/index.ts';
    console.log('Creating a Webpack bundle of the video');
    const bundleLocation = await bundle(
      path.join(process.cwd(), entry),
      () => undefined,
      {
        // If you have a Webpack override, make sure to add it here
        webpackOverride,
      },
    );
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
      throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
    }

    const outputLocation = getFilePath(id);
    console.log('Attempting to render:', outputLocation);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
    });
    console.log('Render done!');
    return {};
  }

  @OnQueueCompleted()
  onCompleted(
    job: Job<JobParams>,
    result: Awaited<ReturnType<typeof this.transcode>>,
  ) {
    // TODO: sse
    // TODO: schedule deletion
  }
}
