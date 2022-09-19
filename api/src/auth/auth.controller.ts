import {
  Req,
  Controller,
  Post,
  UseGuards,
  Param,
  HttpCode,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import CreateDto from 'src/account/dto/create.dto';
import { AccountService } from '../account/account.service';
import { AuthService } from './auth.service';
import RequestWithAccount from './dto/reqWithAccount.interface';
import { LocalAuthGuard } from './gaurd/localAuth.gaurd';
import { Role } from 'src/account/account.enum';
import email from '../../utils/constants/email';
import { MailService } from 'src/mail/mail.service';
import RenewPasswordDto from './dto/renewPassword.dto';
import { IAuthResponse } from './auth.types';
import { SettingService } from 'src/setting/setting.service';
import { SETTING_FIELDS_MAPPING } from 'utils/constants/settings';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { sleep } from 'utils/func';
import JwtAuthGuard from './gaurd/jwtAuth.gaurd';
import { UsedFor } from './auth.enum';

const { RESET_PASSWORD, VERIFY_EMAIL, REVERIFY_EMAIL } = email;
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly mailService: MailService,
    private readonly settingService: SettingService,
  ) {}

  @Post('register')
  async createAccount(@Body() body: CreateDto ): Promise<IAuthResponse> {
    try {
      // Get register-status from setting to check register-status
      const { settings, keysNotFound } = await this.settingService.getByFields(SETTING_FIELDS_MAPPING.enable_registration);
      if (keysNotFound.length > 0) {
        throw new Http506Exception('setting.not-initial', { notFound: keysNotFound });
      }
      const isRegisterEnabled = settings[SETTING_FIELDS_MAPPING.enable_registration];
      if (!isRegisterEnabled) {
        throw new Http400Exception('system.register.disabled');
      }
      const accountInfo = { ...body, role: Role.User };
      const accountWithUsername = await this.accountService.getByFields({
        username: body.username,
      });
      if (accountWithUsername) {
        throw new Http400Exception('register.username.duplicated');
      }
      const accountWithEmail = await this.accountService.getByFields({
        email: body.email,
      });
      if (accountWithEmail) {
        throw new Http400Exception('register.email.duplicated');
      }
      const account = await this.accountService.create(accountInfo);
      const { tokenAuth } = this.authService.genToken({ accountId: account.id });
      return {
        account: this.accountService.transformAccountData(account, account)[0],
        token: tokenAuth,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(200)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() { user }: RequestWithAccount,
  ): Promise<IAuthResponse> {
    try {
      const { tokenAuth } = this.authService.genToken({ accountId: user.id });
      return {
        account: this.accountService.transformAccountData(user, user)[0],
        token: tokenAuth,
      };
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(200)
  @Post('forgot-password/:email')
  async forgotPassword(
    @Param('email') email: string, 
  ): Promise<boolean> {
    try {
      const accountWithEmail = await this.accountService.getByFields({ email });
      if (!accountWithEmail) {
        // Fake: wait to query data
        await sleep();
        return true;
      }
      // Remove all of auth, which not expire & not use with same purpose!
      await this.authService.findAndDeleteAuthNotUse(accountWithEmail, 'RESET_PASSWORD');
      // Create new token for this request
      const token = await this.authService.create(UsedFor.ResetPassword, accountWithEmail);
      // Handle send an email to this account
      const mailStatus = await this.mailService.send(
        {
          name: accountWithEmail.display_name,
          email: accountWithEmail.email,
        },
        'RESET_PASSWORD',
        token
      );
      console.info('\n===================== MAIL SENT =========================\n');
      console.info('Mail status:', mailStatus);
      console.info('\n=========================================================\n');

      // For secure, always return true.
      return true;
    } catch (err) {
      throw err;
    }
  }

  @HttpCode(200)
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async resendValidate(
    @Req() { user }: RequestWithAccount,
  ): Promise<boolean> {
    try {
      
      // Remove all of auth, which not expire & not use with same purpose!
      await this.authService.findAndDeleteAuthNotUse(user, UsedFor.VerifyEmail, UsedFor.ReverifyEmail);
      // Create new token for this request
      const token = await this.authService.create(UsedFor.VerifyEmail, user);
      // Handle send an email to this account
      const mailStatus = await this.mailService.send(
        {
          name: user.display_name,
          email: user.email,
        },
        'VERIFY_EMAIL',
        token
      );
      console.info('\n===================== MAIL SENT =========================\n');
      console.info('Mail status:', mailStatus);
      console.info('\n=========================================================\n');

      // For secure, always return true.
      return mailStatus.accepted[0] === user.email;
    } catch (err) {
      throw err;
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Query() { token }: { token: string },
    @Body() { newPassword }: RenewPasswordDto,
  ) {
    try {
      const authInfo = await this.authService.getByToken(token);
      if (authInfo.used_for !== RESET_PASSWORD) {
        throw new Http400Exception('auth.wrong-purpose', { purpose: authInfo.used_for });
      }
      await this.authService.used(authInfo);
      const updatePwd = await this.accountService.updatePassword(authInfo.account, newPassword);
      // Handle send an email to this account
      const mailStatus = await this.mailService.send(
        {
          name: authInfo.account.display_name,
          email: authInfo.account.email,
        },
        'NOTIFY_CHANGE_PASSWORD',
      );
      console.info('\n===================== MAIL SENT =========================\n');
      console.info('Mail status:', mailStatus);
      console.info('\n=========================================================\n');
      return !!updatePwd;
    } catch (err) {
      throw err;
    }
  }

  @Get('validate')
  async validateEmail(
    @Query() { token }: { token: string },
  ) {
    try {
      const authInfo = await this.authService.getByToken(token);
      if (authInfo.used_for !== VERIFY_EMAIL && authInfo.used_for !== REVERIFY_EMAIL) {
        throw new Http400Exception('auth.wrong-purpose', { purpose: authInfo.used_for });
      }
      const account = await this.accountService.validate(authInfo.account);
      await this.authService.used(authInfo);
      return !!account;
    } catch (err) {
      throw err;
    }
  }

  @Get('/token')
  async validToken(
    @Query() { token }: { token: string },
  ): Promise<{ email: string; purpose: string }> {
    try {
      const authInfo = await this.authService.getByToken(token);
      const hiddenEmail = this.genHiddenEmail(authInfo.account.email);
      const res = {
        email: hiddenEmail,
        purpose: authInfo.used_for,
      };
      return res;
    } catch (err) {
      throw err;
    }
  }

  private genHiddenEmail(email: string): string {
    const [prepend, append] = email.split('@');
    const newPre = prepend.slice(prepend.length - 4, prepend.length);
    const newApp = append.split('.')[0];
    return `***${newPre}@${newApp}.***`;
  }
}
