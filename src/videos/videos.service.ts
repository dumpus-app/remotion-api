import { Injectable, StreamableFile } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'node:fs';
import { webpackOverride } from '../../video/webpack-override';
import fsp from 'fs/promises';

@Injectable()
export class VideosService {
  private getFilePath(id: string) {
    return path.join(process.cwd(), `./out/Video-${id}.mp4`);
  }

  private async fileExists(path: string) {
    return !!(await fsp.stat(path).catch((e) => false));
  }

  async create(createVideoDto: CreateVideoDto) {
    const inputProps = createVideoDto;
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

    const id = uuidv4();
    const outputLocation = this.getFilePath(id);
    console.log('Attempting to render:', outputLocation);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
    });
    console.log('Render done!');
    return { id };
  }

  async findOne(id: string) {
    const filePath = this.getFilePath(id);

    const fileExists = await this.fileExists(filePath);
    if (!fileExists) return false;

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }
}
