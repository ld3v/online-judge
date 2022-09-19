import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Http314Exception } from 'utils/Exceptions/http314.exception';
import { ResponseWithData } from 'utils/responseFormat';
import { Role } from './account/account.enum';
import { AccountService } from './account/account.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {}

  @Get()
  getHello(): ResponseWithData {
    return this.appService.getHello();
  }

  @Get('configs')
  public async getConfig() {
    try {
      const maintenance = this.configService.get('MAINTENANCE');
      const maintenanceDays = moment(maintenance, 'X').isValid() ? moment(maintenance, 'X').diff(moment(), 'days', true) : 0;
      if (`${maintenance}` === "true" || maintenanceDays > 0) {
        throw new Http314Exception(`${maintenance}`);
      }
      // Get WECODE configurations and return here!
      // <Your code />
      return {}
    } catch (err) {
      throw err;
    }
  }

  @Get('init')
  public async initApp(): Promise<string> {
    const username = this.configService.get('APP_ACCOUNT_USER');
    const display_name = this.configService.get('APP_ACCOUNT_NAME') || 'Admin';
    const password = this.configService.get('APP_ACCOUNT_PASS');

    try {
      const existed = await this.accountService.getByFields(
        { username },
        true,
      );
      if (existed) {
        return 'Hi, I am here!';
      }
      const adminAccount = await this.accountService.create(
        { username, display_name, password, role: Role.Admin, email: '', is_root: true },
      );
      if (!adminAccount) {
        return 'Ohh! Where am I! Can I see me!?';
      }
      return 'Thank for awake me up!';
    } catch (err) {
      if (err && err.message === 'Email was existed in database') {
        return `So early, now is ${moment().format('HH:mm - DD/MM/YY')}`;
      }
      console.error('[ERR] - Error when run init: ', err);
      return 'Ohh! I think i have COVID-19 virus!!';
    }
  }
}
