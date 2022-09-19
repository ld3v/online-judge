import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Account } from '../account/entities/account.entity';
import email, { EMAIL_PURPOSE } from '../../utils/constants/email';
import { Http503Exception } from '../../utils/Exceptions/http503.exception';
import { ConfigService } from '@nestjs/config';

const { CREATE_PASSWORD, RESET_PASSWORD, VERIFY_EMAIL, REVERIFY_EMAIL, NOTIFY_LOCK_ACCOUNT, MAP_PURPOSE_INFO } = email;

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configSrv: ConfigService,
  ) {}

  async send(user: { name: string, email: string }, purpose: EMAIL_PURPOSE, ...options: any) {
    try {
      const emailInfo = MAP_PURPOSE_INFO[purpose];
      if (!emailInfo) {
        throw new Http503Exception('feature:service.mail.send');
      }
      const variables = this.generateData(purpose, options);
  
      return await this.mailerService.sendMail({
        to: user.email,
        subject: emailInfo.title,
        template: emailInfo.template,
        context: {
          name: user.name,
          ...variables,
        },
      });
    } catch (err) {
      console.error('[E] - MAIL-SERVICE - SEND:', err);
      throw new Http503Exception('feature:service.mail.send');
    }
  }

  private generateData(purpose: EMAIL_PURPOSE, info: any[]) {
    if (
      purpose === CREATE_PASSWORD ||
      purpose === RESET_PASSWORD ||
      purpose === VERIFY_EMAIL ||
      purpose === REVERIFY_EMAIL
    ) {
      const token = info[0];
      const domain = this.configSrv.get('APP_FRONTEND_URL') || '';
      return {
        url: `${domain}/auth?token=${encodeURIComponent(token)}`,
      };
    }
    if (purpose === NOTIFY_LOCK_ACCOUNT) {
      return {
        reason: info[0],
      };
    }

    // Un-comment below rows, to allow send an email to invite someone join this app.
    // if (purpose === INVITE) {
    //   const token = info[0];
    //   const domain = this.configSrv.get('APP_FRONTEND_URL') || '';
    //   const url = `${domain}/auth/create-password?token=${token}`;
    //   const inviter = info[1];
    //   return {
    //     url,
    //     inviter: `${inviter.name} (${inviter.email})`,
    //     role: info[2],
    //   };
    // }
    return {};
  }
}
