import { forwardRef, Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { ProblemLangRepository, ProblemRepository } from './problem.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from 'src/language/language.module';
import { LocalFileModule } from 'src/files/localFile.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProblemRepository, ProblemLangRepository]),
    forwardRef(() => LanguageModule),
    LocalFileModule,
    LoggerModule,
  ],
  providers: [ProblemService],
  controllers: [ProblemController],
  exports: [ProblemService, TypeOrmModule],
})
export class ProblemModule {}
