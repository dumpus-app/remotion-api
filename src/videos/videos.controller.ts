import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  Res,
  Sse,
  Logger,
  Req,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('videos')
export class VideosController {
  private logger = new Logger(`VideosController`);

  constructor(private readonly videosService: VideosService) {}

  @Post()
  create(@Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  @Get(':id')
  async findOne(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    const file = await this.videosService.findOne(id);

    if (!file) {
      throw new HttpException('No video available for this id.', 404);
    }

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="video.mp4"',
    });
    return file;
  }

  // 5 minutes TTL
  // Limit set to 5
  @Throttle(5, 5 * 60)
  @Sse('sse/:id')
  sse(@Req() req: Request, @Param('id') id: string) {
    const { protocol, method, url } = req;
    this.logger.log(
      `[${new Date().toISOString()}] ${protocol}: ${method} ${url}`,
    );

    return this.videosService.sse(id);
  }
}
