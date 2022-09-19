import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import LoginDto from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as Crypto from 'crypto-js';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import genToken from './dto/genToken';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRepository } from './auth.repository';
import { Account } from '../account/entities/account.entity';
import { Auth } from './entities/auth.entity';
import * as moment from 'moment';
import { In, MoreThan } from 'typeorm';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { EMAIL_PURPOSE } from 'utils/constants/email';
import { UsedFor } from './auth.enum';

const AUTH_SELECTED_FIELDS = [
  'auth.used_for',
  'auth.created_at',
  'auth.expired_at',
  'auth.is_used',
  'auth.id',
];

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
    @Inject(forwardRef(() => AccountService))
    private accountService: AccountService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }: LoginDto) {
    try {
      const account = await this.accountService.getByFields(
        { username },
        true,
        'find-only',
        ['acc.password']
      );
      if (!account) {
        throw new Http400Exception('auth.account.notfound');
      }
      const isValid = await bcrypt.compare(password, account.password);
      if (!isValid) {
        throw new Http400Exception('auth.account.notfound');
      }
      if (account.is_locked) {
        throw new Http400Exception('account.no-access');
      }
      return account;
    } catch (e) {
      throw e;
    }
  }

  public genToken(payload: genToken): { tokenAuth: string } {
    const tokenAuth = this.jwtService.sign(payload);
    return {
      tokenAuth,
    }
  }

  public async create(
    usedFor: UsedFor,
    usedBy: Account,
    expiredAt?: Date,
  ): Promise<string> {
    const newAuth = this.authRepository.create();
    newAuth.expired_at = expiredAt || moment().add(3, 'hours').toDate();
    newAuth.used_for = usedFor;
    newAuth.account = usedBy;
    const data = await this.authRepository.save(newAuth);
    return this.encryptToken(data.token);
  }

  /**
   * Used to get and update AuthToken to used (if need).
   * @param {string} token Token
   * @param {boolean} withUsed Get any auth items, which is used? Default is `false`.
   * @returns Auth model
   */
  public async getByToken(
    tokenEncrypted: string ,
    withUsed: boolean = false,
    showErrIfErr: boolean = true,
  ): Promise<Auth> {
    const token = this.decryptToken(tokenEncrypted);
    if (!token) {
      // input `tokenEncrypted` wrong format
      throw new Http400Exception('auth.invalid', {
        token: tokenEncrypted,
      })
    }
    let authQuery = this.authRepository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.account', 'account')
      .select([...AUTH_SELECTED_FIELDS, 'account.email', 'account.display_name', 'account.id'])
      .where('auth.token = :token', { token })
      .andWhere('auth.expired_at > :now', { now: new Date()});
    if (!withUsed) {
      authQuery = authQuery.andWhere("auth.is_used = false");
    }
    const authItem = await authQuery.getOne();
    if (!authItem && showErrIfErr) {
      throw new Http400Exception('auth.notfound', { token });
    }
    const isExpired = moment().isAfter(moment(authItem.expired_at));
    if (isExpired) {
      throw new Http400Exception(
        'auth.notfound',
        {
          expiredAt: authItem.expired_at,
        },
      );
    }
    return authItem;
  }

  public async findAndDeleteAuthNotUse(account: Account, ...useFor: EMAIL_PURPOSE[]) {
    const allNotUse = await this.authRepository.find({
      account,
      used_for: In(useFor),
      is_used: false,
      expired_at: MoreThan(new Date),
    });
    const allNotUseDeleted = allNotUse.map(i => ({ ...i, is_used: true }));
    return await this.authRepository.save(allNotUseDeleted);
  }

  /**
   * Set an auth item to `used`.
   * @param {Auth} auth Auth item need to set to `used`.
   * @param {boolean} isUsed Is set to `used`? Default is `true`.
   * @returns {Auth} Auth used.
   */
  public async used(auth: Auth, isUsed: boolean = true): Promise<Auth> {
    auth.is_used = isUsed;
    return await this.authRepository.save(auth);
  }

  // DECRYPT or ENCRYPT string
  private decryptToken (token: string, secret?: string) {
    try {
      const secretStr = secret || this.configService.get('AUTH_SECRET_STR');
      const tokenBytes = Crypto.AES.decrypt(token, secretStr);
      return tokenBytes.toString(Crypto.enc.Utf8);
    } catch (err) {
      console.error('[E] - DECRYPT STRING - AES:', err);
      throw new Http503Exception('feature:decryptToken');
    }
  }
  private encryptToken (token: string, secret?: string) {
    try {
      const secretStr = secret || this.configService.get('AUTH_SECRET_STR');
      return Crypto.AES.encrypt(token, secretStr).toString();
    } catch (err) {
      console.error('[E] - ENCRYPT STRING - AES:', err);
      throw new Http503Exception('feature:encryptToken');
    }
  }
}
