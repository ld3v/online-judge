import { forwardRef, Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { ProblemLangRepository, ProblemRepository } from './problem.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from 'src/language/language.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProblemRepository, ProblemLangRepository]),
    forwardRef(() => LanguageModule),
  ],
  providers: [ProblemService],
  controllers: [ProblemController],
  exports: [ProblemService, TypeOrmModule],
})
export class ProblemModule {}
