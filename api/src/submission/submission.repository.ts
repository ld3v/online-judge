import { Repository, EntityRepository } from 'typeorm';
import { Submission } from './entities/submission.entity';

@EntityRepository(Submission)
export class SubmissionRepository extends Repository<Submission> {}
