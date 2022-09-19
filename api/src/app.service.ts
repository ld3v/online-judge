import { Injectable } from '@nestjs/common';
import { ResponseWithData } from 'utils/responseFormat';

@Injectable()
export class AppService {
  getHello(): ResponseWithData {
    return {
      message: 'OK! I AM FINE'
    };
  }
}
