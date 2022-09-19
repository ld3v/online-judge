import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingController } from './setting.controller';
import { SettingRepository } from './setting.repository';
import { SettingService } from './setting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingRepository]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
