import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import CustomLogger from './customLogger';

@Module({
  imports: [ConfigModule],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
