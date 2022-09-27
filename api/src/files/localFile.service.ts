import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalFile } from './entities/localFile.entity';
import { LocalFileRepository } from './localFile.repository';
import { IAddLocalFile } from './localFile.type';

@Injectable()
export class LocalFileService {
  constructor(
    @InjectRepository(LocalFileRepository)
    private localFileRepository: LocalFileRepository,
  ) {}

  public async addFile ({ filename, filetype, filepath }: IAddLocalFile): Promise<LocalFile> {
    const newFile = new LocalFile();
    newFile.filename = filename;
    newFile.path = filepath;
    newFile.mimetype = filetype;

    const resNewFile = await this.localFileRepository.save(newFile);
    return resNewFile;
  }
}
