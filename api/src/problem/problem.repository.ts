import { Repository, EntityRepository } from 'typeorm';
import { Problem } from './entities/problem.entity';
import { ProblemLanguage } from './entities/problem_language.entity';

@EntityRepository(Problem)
export class ProblemRepository extends Repository<Problem> {}

@EntityRepository(ProblemLanguage)
export class ProblemLangRepository extends Repository<ProblemLanguage> {}
