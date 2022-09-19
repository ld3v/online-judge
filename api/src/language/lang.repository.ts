import { Repository, EntityRepository } from 'typeorm';
import { Language } from './entities/language.entity';

@EntityRepository(Language)
export class LangRepository extends Repository<Language> {}
