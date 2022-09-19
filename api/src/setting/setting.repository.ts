import { Repository, EntityRepository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@EntityRepository(Setting)
export class SettingRepository extends Repository<Setting> {}
