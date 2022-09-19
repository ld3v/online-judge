import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    ProblemModule,
    ConfigModule,
    MailModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService, TypeOrmModule],
})
export class AccountModule {}
