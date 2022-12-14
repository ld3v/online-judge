import { Injectable } from '@nestjs/common';
import { ResponseWithData } from 'utils/responseFormat';

@Injectable()
export class AppService {
  getHello(): ResponseWithData {
    return {
      message: 'Hi, I am Huy. Maybe you are trying to cheat my app. I don\'t known why, and who you are, please mail to me at "nqh.d3v@gmail.com" and I will reply username & password for you :)'
    };
  }
}
