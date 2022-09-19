import { Repository, EntityRepository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentAccount } from './entities/assignment_account.entity';
import { AssignmentProblem } from './entities/assignment_problem.entity';

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {}

@EntityRepository(AssignmentProblem)
export class AssignmentProblemRepository extends Repository<AssignmentProblem> {}

@EntityRepository(AssignmentAccount)
export class AssignmentAccountRepository extends Repository<AssignmentAccount> {}
