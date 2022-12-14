import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = httpStatus === 404 ? {
      username: "Congratulate! You got the flag!!!",
      content: {
        message: "What the f*ck! I don't know what make you want to access to my server. It just only a student project for my school! What do you want to do after access to my server? Show off result for your friends? Email to me and ask my money? It just a student project, no money, OK? So, to easy to hack my server, below is information about my project & my server!",
      },
      project: {
        name: "Judge Online",
        source: "https://github.com/nqhd3v/online-judge",
        description: "Yeah, on this server, I just use to build my backend (api & sharif-judge directory)",
        notes: [
          "First, thank you so much for take time to check security for my server! By the way, if you found any problem, which allow you access to my server, best regards to say thanks!",
          "Second, anyway, to improve security for my server, I will set up White list IP for it at 23:00 - 04/12/2022 (+7), so, if you want to access to it, please try before it!"
        ],
      }
    } : {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus === 404 ? 200 : httpStatus);
  }
}
