import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { Role } from 'src/account/account.enum';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { Queue as QueueEntity } from 'src/queue/entities/queue.entity';
import { SYNC_PROCESS_KEY } from 'src/setting/setting.processor';
import { QueueName, QueueState } from 'src/queue/queue.enum';
import { QueueService } from 'src/queue/queue.service';
import { SETTING_FIELDS_MAPPING } from 'utils/constants/settings';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import SettingDto from './dto/setting.dto';
import { SettingService } from './setting.service';
import { AssignmentService } from 'src/assignment/assignment.service';

@Controller('settings')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    @InjectQueue('setting') private readonly settingQueue: Queue,
    private readonly assignmentService: AssignmentService,
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

  @Get('/sync-data')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async getSyncDataStatus () {
    try {
      const currentProcess = await this.queueService.getCurrentProcess(QueueName.SettingSyncAllData);
      const history = await this.queueService.getHistoryProcesses(QueueName.SettingSyncAllData);
      
      return {
        current: currentProcess
          ? this.queueService.transformData(currentProcess)[0]
          : undefined,
        history: this.queueService.transformData(...history),
      };
    } catch (err) {
      throw err;
    }
  }

  @Post('/sync-data')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async syncData () {
    try {
      // Check if have any current process -> Not run.
      const currentProcess = await this.queueService.getCurrentProcess(QueueName.SettingSyncAllData);
      if (currentProcess) {
        throw new Http400Exception("setting.sync-all-data.processing");
      }
      const queueId = QueueEntity.genId();
      await this.settingQueue.add('syncAllData', {},{ jobId: queueId });
      const queueRes = await this.queueService.add({
        id: queueId,
        name: QueueName.SettingSyncAllData,
        process: {
          [SYNC_PROCESS_KEY.ACCOUNT]: QueueState.Processing,
          [SYNC_PROCESS_KEY.ASSIGNMENT]: QueueState.Processing,
          [SYNC_PROCESS_KEY.PROBLEM]: QueueState.Processing,
          [SYNC_PROCESS_KEY.PROBLEM_LANGUAGES]: QueueState.Processing,
          [SYNC_PROCESS_KEY.ASSIGNMENT_PROBLEMS]: QueueState.Processing,
          [SYNC_PROCESS_KEY.LANGUAGE]: QueueState.Processing,
        },
      });
      return this.queueService.transformData(queueRes)[0];
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
    @Body() { default_coefficient_rules, ...data}: SettingDto
  ) {
    try {
      // Verify rules
      this.assignmentService.validateCoefficientRules(default_coefficient_rules);
      // Update data
      const settings = await this.settingService.update({
        default_coefficient_rules: JSON.stringify(default_coefficient_rules),
        ...data
      });
      const settingsTransformed = this.settingService.transformSetting(settings);
      return settingsTransformed;
    } catch (err) {
      throw err;
    }
  }
}
