import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { ProblemModule } from 'src/problem/problem.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountRepository]),
    forwardRef(() => AuthModule),
    LoggerModule,
    ProblemModule,
    ConfigModule,
    MailModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
