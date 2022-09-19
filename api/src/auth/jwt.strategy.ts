import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AccountService } from '../account/account.service';
import { ROLES } from '../../utils/constants/roles';
import genToken from './dto/genToken';
import { Http401Exception } from '../../utils/Exceptions/http401.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: genToken) {
    const { accountId } = payload;
    const account = await this.accountService.getById(accountId, false, false);
    if (!account) {
      throw new Http401Exception('account.notfound');
    }
    return account;
  }
}
