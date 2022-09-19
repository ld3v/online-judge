import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { SETTING_FIELDS_AVAILABLE } from 'utils/constants/settings';
import { Http502Exception } from 'utils/Exceptions/http502.exception';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import { array2Map } from 'utils/func';
import { FoundAndNotFoundResult } from 'utils/types';
import { Setting } from './entities/setting.entity';
import { SettingRepository } from './setting.repository';
import { ISetting, TSettingFindResult } from './setting.types';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingRepository)
    private readonly settingRepository: SettingRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async syncWithJudge(): Promise<Record<string, any>> {
    // Get setting on JUDGE system
    const judgeSettings = await this.getJudgeSettings();
    // Transform judgeSetting -> Available setting for current system.
    return await this.update(judgeSettings);
  }

  public async update(newSetting: ISetting): Promise<Record<string, any>> {
    // Get current settings.
    const currentSettings = await this.settingRepository.find();
    const currentSettingFields = currentSettings.map(settingItem => settingItem.key);
    // Transform input -> Available setting for current system.
    const settingsAvailable: Record<string, any> = {};
    Object.keys(newSetting).forEach((key: string) => {
      if (SETTING_FIELDS_AVAILABLE.includes(key)) {
        settingsAvailable[key] = newSetting[key];
      }
    });

    const settingFieldsNeedCreate = SETTING_FIELDS_AVAILABLE.filter((key: string) => !currentSettingFields.includes(key));

    const newSettings = settingFieldsNeedCreate.map((key: string) => this.settingRepository.create({ key, value: newSetting[key] }));
    const settingsUpdate = currentSettings.filter(({key}) => SETTING_FIELDS_AVAILABLE.includes(key)).map(({ key }) => ({ key, value: newSetting[key] }));

    const settingsUpdated = await this.settingRepository.save([...newSettings, ...settingsUpdate]);
    const { map } = array2Map(settingsUpdated, 'key');
    return map;
  }

  public async get(): Promise<Record<string, any>> {
    const data = await this.settingRepository.find();
    const { map } = array2Map(data, 'key');
    return map;
  }

  public async getByFields(...fields: string[]): Promise<{ settings: TSettingFindResult, keysNotFound: string[] }> {
    const settingItems = await this.settingRepository.createQueryBuilder('setting')
      .where('key IN (:...fields)', { fields })
      .getMany();
    const keysFound = settingItems.map(s => s.key);
    const keysNotFound = fields.filter(field => !keysFound.includes(field));
  
    const { map } = array2Map(settingItems, 'key');
    return {
      settings: map,
      keysNotFound,
    };
  }

  private async getJudgeSettings() {
    try {
      const judgeURL = this.configService.get('JUDGE_URL');
      if (!judgeURL) {
        throw new Http506Exception("judge.no-url");
      }
      const url = `${this.configService.get('JUDGE_URL')}/third_party/settings`;
      const res = await this.httpService.axiosRef.get(url);
      const { is_error, msg, ...settingValues }: any = res.data || { is_error: true, msg: 'Unknown error!'};
      if (is_error) {
        throw new Http502Exception(msg);
      }
      return settingValues;
    } catch (err) {
      console.error('Error when try to connect to JUDGE:', err);
      throw new Http502Exception("judge.no-connect");
    }
  }

  public transformSetting(settings: Record<string, string>): Record<string, any> {
    return {
      ...settings,
      concurent_queue_process: Number(settings.concurent_queue_process),
      enable_c_shield: `${settings.enable_c_shield}` === "true",
      enable_cpp_shield: `${settings.enable_cpp_shield}` === "true",
      enable_py2_shield: `${settings.enable_py2_shield}` === "true",
      enable_py3_shield: `${settings.enable_py3_shield}` === "true",
      enable_registration: `${settings.enable_registration}` === "true",
      file_size_limit: Number(settings.file_size_limit),
      output_size_limit: Number(settings.output_size_limit),
      submit_penalty: Number(settings.submit_penalty),
    }
  }
}
