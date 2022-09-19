import { Repository, EntityRepository } from 'typeorm';
import { Account } from './entities/account.entity';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {}
