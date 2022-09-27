import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalFileController } from './localFile.controller';
import { LocalFileRepository } from './localFile.repository';
import { LocalFileService } from './localFile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalFileRepository]),
    ConfigModule,
  ],
  controllers: [LocalFileController],
  providers: [LocalFileService],
  exports: [LocalFileService],
})
export class LocalFileModule {}
