import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/account/account.enum';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { SETTING_FIELDS_MAPPING } from 'utils/constants/settings';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import SettingDto from './dto/setting.dto';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async getAll (
    // @Req() { user }: RequestWithAccount
  ) {
    try {
      // Currently, I see user not need to get settings for any purposes!
      // -> Use API for admin only
      const settings = await this.settingService.get();
      const settingsTransformed = this.settingService.transformSetting(settings);
      return settingsTransformed;
    } catch (err) {
      throw err;
    }
  }

  @Get('/register-available')
  async getRegisterStatus () {
    try {
      const { settings, keysNotFound } = await this.settingService.getByFields(SETTING_FIELDS_MAPPING.enable_registration);
      if (keysNotFound.length > 0) {
        throw new Http506Exception('setting.not-initial', { notFound: keysNotFound });
      }
      const isRegisterEnable = settings[SETTING_FIELDS_MAPPING.enable_registration];
      return isRegisterEnable && isRegisterEnable !== 'false' && isRegisterEnable !== '0';
    } catch (err) {
      throw err;
    }
  }

  @Post('/sync')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async syncSetting () {
    try {
      const settings = await this.settingService.syncWithJudge();
      const settingsTransformed = this.settingService.transformSetting(settings);
      return settingsTransformed;
    } catch (err) {
      throw err;
    }
  }

  @Get('/judge-url')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async getJudgeURL () {
    try {
      const url = await this.configService.get('JUDGE_URL');
      return url;
    } catch (err) {
      throw err;
    }
  }

  @Patch('/')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async updateSetting (
    @Body() data: SettingDto
  ) {
    try {
      const settings = await this.settingService.update(data);
      const settingsTransformed = this.settingService.transformSetting(settings);
      return settingsTransformed;
    } catch (err) {
      throw err;
    }
  }
}
