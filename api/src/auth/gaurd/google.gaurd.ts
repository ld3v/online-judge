import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Http400Exception } from 'utils/Exceptions/http400.exception';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new Http400Exception(
        'google-auth.invalid',
        { message: err.message, name: err.name, code: err.code }
      );
    }
    return user;
  }
}
