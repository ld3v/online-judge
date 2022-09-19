import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { AuthService } from '../auth/auth.service';
import RequestWithAccount from '../auth/dto/reqWithAccount.interface';
import JwtAuthGuard from '../auth/gaurd/jwtAuth.gaurd';
import { Account } from './entities/account.entity';
import { AccountService } from './account.service';
import CreateByAdminDto from './dto/createByAdmin.dto';
import SearchParamsDto from './dto/searchParams.dto';
import UpdateDto from './dto/update.dto';
import { Role } from './account.enum';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { Http403Exception } from 'utils/Exceptions/http403.exception';
import { isAdmin } from 'utils/func';
import { MailService } from 'src/mail/mail.service';
import { ReasonDto } from './dto/reason.dto';
import { UsedFor } from 'src/auth/auth.enum';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  // Get all account in system
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async searchAccount(
    @Req() { user }: RequestWithAccount,
    @Query() { keyword: keywordFilter, role, page, limit, except }: SearchParamsDto,
  ) {
    const keyword = keywordFilter?.trim() || '';
    const exceptIds = except?.split(',') || [];
    const queryParamsByRole = isAdmin(
      user,
      { keyword, role, page, limit, exceptIds },
      { page, limit },
    );
    try {
      const { data, total } = await this.accountService.get(queryParamsByRole);
      return {
        data: this.accountService.transformAccountData(user, ...data),
        total,
      };
    } catch (e) {
      throw e;
    }
  }

  // Get account by id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Req() { user }: RequestWithAccount,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const accountId = id === "me" ? user.id : id;
      if (accountId !== user.id && user.role !== Role.Admin) {
        throw new Http403Exception("account.no-access.other-account");
      }
      const account = await this.accountService.getById(accountId, user.role === Role.Admin);
      return this.accountService.transformAccountData(user, account)[0];
    } catch (e) {
      throw e;
    }
  }

  // /**
  //  * Send request to create an account
  //  * @param {CreateDto} data Data to create an account
  //  * @returns {number} Status of action
  //  * n (n > 0): Success - Will be respond in n hours
  //  * 0  : Locked
  //  * -1 : Already exist as an account
  //  */
  // @Post()
  // async createAccount(
  //   @Body() { username, password, display_name }: CreateDto,
  // ): Promise<boolean> {
  //   try {
  //     const account = await this.accountService.findByUsername(username, 0);
  //     if (account) {
  //       throw new Http400Exception('account.exist.username', { username });
  //     }
  //     await this.accountService.create({ username, display_name, password, role: Role.User });
  //     // By default, admin will be replied after 48h
  //     return true;
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async createAccountByAdmin(
    @Req() { user }: RequestWithAccount,
    @Body() { username, password, email, display_name, role }: CreateByAdminDto,
  ): Promise<any> {
    try {
      const newAccount = await this.accountService.create(
        {
          username,
          email,
          password,
          display_name,
          role,
          is_validated: true,
        },
      );
      return this.accountService.transformAccountData(user, newAccount)[0];
    } catch (err) {
      throw err;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateInformation(
    @Param('id') id: string,
    @Body() { email, displayName, role }: UpdateDto,
    @Req() { user }: RequestWithAccount,
  ): Promise<Account> {
    try {
      const accountId = id === "me" ? user.id : id;
      if (accountId !== user.id && user.role !== Role.Admin) {
        throw new Http403Exception("account.no-access.other-account");
      }
      const accountNeedUpdate = await this.accountService.getById(accountId);
      const originalEmailInfo = {
        email: accountNeedUpdate.email,
        name: accountNeedUpdate.display_name,
      };
      const dataToUpdate = accountNeedUpdate.is_root || user.role !== Role.Admin
        ? {
          email: email.trim(),
          display_name: displayName.trim(),
        }
        : {
          email: email.trim(),
          display_name: displayName.trim(),
          role
        };
      const { account: accountUpdated, needResendValidateEmail } = await this.accountService.updateInfo(
        accountNeedUpdate,
        dataToUpdate,
      );

      // Handle re-send a new email to validate new email for this account.
      if (needResendValidateEmail) {
        if (originalEmailInfo.email) {
          const mailNotifyChangeEmailStatus = await this.mailService.send(
            originalEmailInfo,
            'NOTIFY_CHANGE_EMAIL',
          );

          console.info('\n===================== MAIL SENT =========================\n');
          console.info('NOTIFY_CHANGE_EMAIL:', mailNotifyChangeEmailStatus);
          console.info('\n=========================================================\n');
        }
        // Remove all of auth, which not expire & not use with same purpose!
        await this.authService.findAndDeleteAuthNotUse(accountUpdated, 'REVERIFY_EMAIL', 'VERIFY_EMAIL');
        // Create new token for this request
        const token = await this.authService.create(UsedFor.ReverifyEmail, accountUpdated);
        const mailReverifyEmailStatus = await this.mailService.send(
          {
            name: accountUpdated.display_name,
            email: accountUpdated.email,
          },
          'REVERIFY_EMAIL',
          token,
        );
        console.info('\n===================== MAIL SENT =========================\n');
        console.info('REVERIFY_EMAIL:', mailReverifyEmailStatus);
        console.info('\n=========================================================\n');
      }

      // End - Handle re-send a new email!
      return accountUpdated;
    } catch (err) {
      throw err;
    }
  }

  // LOCK ACCOUNT
  @Patch(':id/_/lock')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async lockAccount(
    @Param('id') id: string,
    @Body() { reason }: ReasonDto
  ): Promise<boolean> {
    try {
      const accountNeedLock = await this.accountService.getById(id, true);
      if (accountNeedLock.is_locked) {
        throw new Http400Exception('account.locked-before');
      }
      const account = await this.accountService.lock(accountNeedLock);
      // Handle send an email to this account
      if (account.email) {
        const mailStatus = await this.mailService.send(
          {
            name: account.display_name,
            email: account.email,
          },
          'NOTIFY_LOCK_ACCOUNT',
          reason
        );
        console.info('\n===================== MAIL SENT =========================\n');
        console.info('Mail status:', mailStatus);
        console.info('\n=========================================================\n');
      }
      return !!account;
    } catch (e) {
      throw e;
    }
  }

  // UNLOCK ACCOUNT
  @Patch(':id/_/unlock')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async unLockAccount(
    @Param('id') id: string,
  ): Promise<boolean> {
    try {
      const accountNeedUnLock = await this.accountService.getById(id, true);
      if (!accountNeedUnLock.is_locked) {
        throw new Http400Exception('account.unlock-before');
      }
      const account = await this.accountService.lock(accountNeedUnLock, false);
      return !!account;
    } catch (e) {
      throw e;
    }
  }

  // @Patch('password')
  // async createPassword(
  //   @Body() { password }: PasswordDto,
  //   @Query() { token }: { token: string },
  // ): Promise<boolean> {
  //   try {
  //     const status = await this.accountService.updatePasswordWithAuthToken(
  //       token,
  //       password,
  //     );
  //     return status;
  //   } catch (e) {
  //     console.error('error', e);
  //     throw e;
  //   }
  // }
}
