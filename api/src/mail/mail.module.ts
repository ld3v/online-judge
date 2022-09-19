import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configSrv) => ({
        transport: {
          host: configSrv.get('MAIL_HOST'),
          // secure: true,
          // auth: {
          //   user: configSrv.get('MAIL_USER'),
          //   pass: configSrv.get('MAIL_PASS'),
          // },
          port: Number(configSrv.get('MAIL_PORT')),
        },
        defaults: {
          from: `"${configSrv.get('MAIL_FROM')}" <${configSrv.get(
            'MAIL_USER',
          )}>`,
        },
        template: {
          dir: join(__dirname, 'mailTemplates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    ConfigModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
