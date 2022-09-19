import { Request } from 'express';
import { Account } from '../../account/entities/account.entity';

interface RequestWithAccount extends Request {
  user: Account;
}

export default RequestWithAccount;
