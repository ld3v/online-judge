import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import defaultValues from '../../utils/constants/defaultValues';
import { Account } from './entities/account.entity';
import { AccountRepository } from './account.repository';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { FoundAndNotFoundResult, SuccessAndFailed } from 'utils/types';
import { ifViewByAdmin } from 'utils/func';
import { AccountFilter, IAccountTransformed, ICreateOne, IUpdateOne, TGetAccountStatus } from './account.types';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { Role } from './account.enum';
import { ProblemService } from 'src/problem/problem.service';
import CustomLogger from 'src/logger/customLogger';

const { HASH_SALT_DEFAULT } = defaultValues;
const ACC_SELECTED_FIELDS = [
  "acc.id",
  "acc.display_name",
  "acc.username",
  "acc.email",
  "acc.role",
  "acc.is_locked",
  "acc.is_root",
  "acc.is_validated",
  "acc.created_at",
  "acc.selected_assignment"
];

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountRepository)
    private readonly accountRepository: AccountRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly problemService: ProblemService,
    private readonly configSrv: ConfigService,
    private readonly logger: CustomLogger,
  ) {}

  public async get({ keyword, role, page, limit, exceptIds }: AccountFilter) {
    let accountsQuery = this.accountRepository.createQueryBuilder('acc')
      .leftJoinAndSelect("acc.problems_created", "problem")
      .select([...ACC_SELECTED_FIELDS, "problem.id", "problem.name"]);
    if (keyword) {
      accountsQuery = accountsQuery.andWhere('(acc.email ilike :keyword or acc.username ilike :keyword or acc.display_name ilike :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    if (Array.isArray(exceptIds) && exceptIds.length > 0) {
      accountsQuery = accountsQuery.andWhere('acc.id NOT IN (:...exceptIds)', { exceptIds });
    }
    if (role) {
      accountsQuery = accountsQuery.andWhere('acc.role = :role', { role });
    }
    // Count before get with page, limit
    const countItems = await accountsQuery.getCount();
    // pagination
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limit > 0 && Number(page) > 0) {
      accountsQuery = accountsQuery.limit(limit).skip(limit * (page - 1));
    }
    const accounts = await accountsQuery.getMany();
    return {
      data: accounts,
      total: countItems,
    };
  }

  /**
   * Get an account by its ID.
   * @param {string} id Account's ID
   * @param {boolean} specialAccessible Can access to any accounts, which is locked? Default is `false`
   * @param {boolean} showErrIfErr Is show err if notfound? Default is `true`
   * @returns {Promise<Account>} Data
   */
  async getById(id: string, specialAccessible: boolean = false, showErrIfErr: boolean = true): Promise<Account> {
    let accountQuery = this.accountRepository.createQueryBuilder("acc")
      .leftJoinAndSelect("acc.problems_created", "problem")
      .select([...ACC_SELECTED_FIELDS, "problem.id", "problem.name"])
      .where("acc.id = :id", { id });
    if (!specialAccessible) {
      accountQuery = accountQuery.andWhere("acc.is_locked = false");
    }
    const account = await accountQuery.getOne();
    if (!account && showErrIfErr) {
      throw new Http400Exception('account.notfound', { notFoundId: id });
    }
    return account;
  }
  
  public async getByIds(ids: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<Account>> {
    if (ids.length === 0) {
      return {
        found: [],
        foundKeys: [],
        notFoundKeys: [],
      };
    }
    try {
      let accountItemsQuery = this.accountRepository.createQueryBuilder('acc')
        .leftJoinAndSelect("acc.problems_created", "problem")
        .select([...ACC_SELECTED_FIELDS, "problem.id", "problem.name"]);
      if (Array.isArray(ids) && ids.length > 0) {
        accountItemsQuery = accountItemsQuery.andWhere("acc.id IN (:...ids)", { ids })
      }
        
      const accountItems = await accountItemsQuery.getMany();
      const accountFoundIds = accountItems.map(account => account.id);
      const accountNotFoundIds = ids.filter(id => !accountFoundIds.includes(id));

      if (showErrIfErr && accountNotFoundIds.length > 0) {
        throw new Http400Exception('assignment.notfound', {
          notFoundKeys: accountNotFoundIds,
        });
      }

      return {
        found: accountItems,
        foundKeys: accountFoundIds,
        notFoundKeys: accountNotFoundIds,
      };
    } catch (err) {
      console.error('account.service/getByIds:', err);
      throw new Http503Exception('account.service/getByIds');
    }
  }

  public async getByUsernames(usernames: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<Account>> {
    if (usernames.length === 0) {
      return {
        found: [],
        foundKeys: [],
        notFoundKeys: [],
      };
    }
    try {
      let accountItemsQuery = this.accountRepository.createQueryBuilder('acc')
        .leftJoinAndSelect("acc.problems_created", "problem")
        .select([...ACC_SELECTED_FIELDS, "problem.id", "problem.name"]);
      if (Array.isArray(usernames) && usernames.length > 0) {
        accountItemsQuery = accountItemsQuery.andWhere("acc.username IN (:...usernames)", { usernames })
      }
        
      const accountItems = await accountItemsQuery.getMany();
      const accountFoundUsernames = accountItems.map(account => account.id);
      const accountNotFoundUsernames = usernames.filter(usr => !accountFoundUsernames.includes(usr));

      if (showErrIfErr && accountNotFoundUsernames.length > 0) {
        throw new Http400Exception('assignment.notfound', {
          notFoundUsernames: accountNotFoundUsernames,
        });
      }

      return {
        found: accountItems,
        foundKeys: accountFoundUsernames,
        notFoundKeys: accountNotFoundUsernames,
      };
    } catch (err) {
      console.error('account.service/getByUsernames:', err);
      throw new Http503Exception('account.service/getByUsernames');
    }
  }

  /**
   * Get an account by its username
   * @param {Record<string, string>} fieldValues {[field]: [fieldValue]}
   * @param {boolean} specialAccessible Can access to any accounts, which is locked? Default is `false`
   * @param {TGetAccountStatus} status 'find-only': Find only - 'found': Alert when exist - 'notfound': Alert when not found. Default is `find-only`.
   * @param {boolean} withPassword Get data with password field
   */
  async getByFields(fieldValues: Record<string, string>, specialAccessible: boolean = false, status: TGetAccountStatus = 'find-only', extraFields: string[] = []) {
    // Create query str
    const fieldKeys = Object.keys(fieldValues);
    const whereQuery = fieldKeys.map(k => `${k} = :${k}`).join(' OR ');
    // Query
    let accountQuery = this.accountRepository.createQueryBuilder("acc")
      .leftJoinAndSelect("acc.problems_created", "problem")
      .select([...ACC_SELECTED_FIELDS, "problem.id", "problem.name", ...extraFields])
      .where(`(${whereQuery})`, fieldValues);
    if (!specialAccessible) {
      accountQuery = accountQuery.andWhere("acc.is_locked = false");
    }
    const account = await accountQuery.getOne();
    switch (status) {
      case 'found':
        if (account) throw new Http400Exception('account.existed', fieldValues);
        break;
      case 'notfound':
        if (!account) throw new Http400Exception('account.notfound', fieldValues);
        break;
    }
    return account;
  }

  /**
   * 
   * @param {ICreateOne} data Account data
   * @returns {Promise<Account>} New account with that data.
   */
  public async create({ username, password, email, display_name, role, is_validated, is_root }: ICreateOne): Promise<Account> {
    const encryptedPwd = await this.encryptedPwd(password);
    const newAccount = this.accountRepository.create({
      username,
      password: encryptedPwd,
      display_name,
      email,
      role,
      is_validated,
      is_root,
    });
    return await this.accountRepository.save(newAccount);
  }

  public async importMulti(...accounts: Account[]): Promise<SuccessAndFailed<Account>> {
    const newAccounts = accounts.map(async (acc) => {
      try {
        return await this.accountRepository.save(acc);
      } catch (err) {
        return err;
      }
    });
    const resNewAccounts = await Promise.all(newAccounts);
    
    const success = resNewAccounts.filter(a => !(a instanceof Error));
    const failed = resNewAccounts.filter(a => a instanceof Error);

    return { success, failed };
  } 

  public async updateInfo(
    account: Account,
    { email, display_name, role }: IUpdateOne,
  ): Promise<{ account: Account, needResendValidateEmail: boolean }> {
    let needResendValidateEmail = undefined;
    account.display_name = display_name;

    if (account.email !== email) {
      account.is_validated = false;
      account.email = email;
      needResendValidateEmail = email;
    }
    if (role) {
      account.role = role;
    }

    const accountUpdated = await this.accountRepository.save(account);
    return {
      account: accountUpdated,
      needResendValidateEmail,
    };
  }

  public async updatePassword(account: Account, newPassword: string) {
    const encryptedPwd = await this.encryptedPwd(newPassword);
    account.password = encryptedPwd;
    return await this.accountRepository.save(account);
  }

  public async updateSelectedAssignment(account: Account, assignment: Assignment) {
    account.selected_assignment = assignment.id;
    return await this.accountRepository.save(account);
  }

  // `lock` & `validate` are 2 funcs, which were used to update status for account.
  public async lock(
    account: Account,
    isLock: boolean = true,
  ): Promise<Account> {
    account.is_locked = isLock;
    return await this.accountRepository.save(account);;
  }
  /**
   * Use to update `is_validate` for account
   * @param {Account} account Account need to update `is_validated`
   * @param {boolean} isValidate Is validated? Default is `true`
   * @returns {Account} Current account after update
   */
  public async validate(
    account: Account,
    isValidate: boolean = true,
  ): Promise<Account> {
    account.is_validated = isValidate;
    return await this.accountRepository.save(account);;
  }

  private async encryptedPwd(password: string): Promise<string> {
    const hashSalt = this.configSrv.get('PASS_HASH_SALT') || HASH_SALT_DEFAULT;
    const encryptedPassword = await bcrypt.hash(password, Number(hashSalt));
    return encryptedPassword;
  }

  /**
   * ## DANGER!!!
   * This func will remove all of accounts (Except root accounts)
   * @returns 
   */
  public async removeAllExceptRoot() {
    const accountsNeedRemove = await this.accountRepository.find({ is_root: false });
    const res = await this.accountRepository.remove(accountsNeedRemove);
    return res;
  }

  public transformAccountData (requester: Account, ...accounts: Account[]): IAccountTransformed[] {
    const ifAdmin = ifViewByAdmin(requester);
    return accounts.map(({problems_created, is_locked, created_at, is_root, ...info }) => {
      const problemsTransformed = Array.isArray(problems_created)
        ? this.problemService.transformData(requester, ...problems_created)
        : undefined;
      return {
        id: info.id,
        username: info.username,
        email: info.email,
        displayName: info.display_name,
        role: info.role,
        selectedAssignment: info.selected_assignment,
        isLocked: ifAdmin(is_locked),
        isRoot: ifAdmin(is_root),
        editable: (!is_root || info.id === requester.id) && requester.role === Role.Admin,
        lockable: !is_root,
        roleEditable: !is_root,
        createdAt: ifAdmin(created_at),
        problemsCreated: ifAdmin(problemsTransformed),
        isValidated: requester.id === info.id || requester.role === Role.Admin ? info.is_validated : undefined,
      };
    });
  }
}
