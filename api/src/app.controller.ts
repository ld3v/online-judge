import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Http314Exception } from 'utils/Exceptions/http314.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { ResponseWithData } from 'utils/responseFormat';
import { Role } from './account/account.enum';
import { AccountService } from './account/account.service';
import { AppService } from './app.service';
import CustomLogger from './logger/customLogger';
import { SettingService } from './setting/setting.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly settingService: SettingService,
    private readonly logger: CustomLogger,
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
    try {
      const initAccountMsg = await this.accountService.initDefaultAccount();
      const initSettingMsg = await this.settingService.initDefaultSetting();
      
      return `${initAccountMsg}<br>${initSettingMsg}`;
    } catch (err) {
      throw new Http503Exception('app.init.unknown')
    }
  }
}
