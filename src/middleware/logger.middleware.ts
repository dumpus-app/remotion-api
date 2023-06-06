import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`);
  use(req: Request, res: Response, next: NextFunction) {
    const time = new Date();

    res.on('finish', () => {
      const { protocol, method, url } = req;
      const duration = new Date().getTime() - time.getTime();
      const { statusCode } = res;

      this.logger.log(
        `[${time.toISOString()}] ${protocol}: ${method} ${url} (${duration} ms) ${statusCode}`,
      );
    });

    next();
  }
}
