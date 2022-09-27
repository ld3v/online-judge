import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CustomLogger from 'src/logger/customLogger';
import { ProblemService } from 'src/problem/problem.service';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { FoundAndNotFoundResult, ILang } from 'utils/types';
import { Language } from './entities/language.entity';
import { LangRepository } from './lang.repository';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(LangRepository)
    private readonly langRepository: LangRepository,
    private readonly logger: CustomLogger,
  ) {}

  public async create (data: ILang): Promise<Language> {
    const newLang = this.langRepository.create(data);
    return await this.langRepository.save(newLang);
  }

  public async createMulti (...langModels: Language[]): Promise<Language[]> {
    const res = await this.langRepository.save(langModels);
    return res;
  }

  public async update (curLang: Language, data: ILang): Promise<Language> {
    const updateProb = { ...curLang, ...data };
    return await this.langRepository.save(updateProb);
  }

  public async updateById (id: string, data: ILang): Promise<Language> {
    const curLang = await this.langRepository.findOne(id);
    const updateProb = { ...curLang, ...data };
    return await this.langRepository.save(updateProb);
  }

  /**
   * This func is used to delete lang by its ID
   * @param {string} id Lang's ID
   * @returns {boolean} `true` if success
   */
  public async delete (lang: Language): Promise<boolean> {
    const res = await this.langRepository.delete(lang.id);
    if (!res.affected) {
      throw new Http400Exception('lang.notfound');
    }
    return !!res.affected;
  }

  /**
   * ## DANGER
   * 
   * This func is used to delete all langs
   */
  public async removeAll (): Promise<boolean> {
    const langsNeedRemove = await this.langRepository.find();
    const res = await this.langRepository.remove(langsNeedRemove);
    return !!res;
  }

  /**
   * This func is used to get lang by its ID
   * @param {string} id Lang's ID
   * @param {boolean} showErrIfErr Is show err when err? Default is `true`
   * @returns Language
   */
  public async getById(id: string, showErrIfErr: boolean = true) {
    const curLang = await this.langRepository.findOne(id);
    
    if (!curLang && showErrIfErr) {
      throw new Http400Exception('lang.notfound', {
        notFoundId: id,
      });
    }
    return curLang;
  }

  /**
   * This func is used to get langs by their IDs
   * @param {string} ids Lang's IDs
   * @param {boolean} showErrIfErr Is show err when err? Default is `true`
   * @returns Languages
   */
  public async getByIds(ids: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<Language>> {
    const langItems = await this.langRepository.findByIds(ids);
    const langFoundIds = langItems.map(lang => lang.id);
    const langNotFoundIds = ids.filter(id => !langFoundIds.includes(id));

    if (showErrIfErr && langNotFoundIds.length > 0) {
      throw new Http400Exception('lang.notfound', {
        notFoundKeys: langNotFoundIds,
      });
    }

    return {
      found: langItems,
      foundKeys: langFoundIds,
      notFoundKeys: langNotFoundIds,
    };
  }

  public async getAll() {
    const langs = this.langRepository.find();
    return langs;
  }
}
