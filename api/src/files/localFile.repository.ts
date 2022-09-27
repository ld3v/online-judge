import { Repository, EntityRepository } from 'typeorm';
import { LocalFile } from './entities/localFile.entity';

@EntityRepository(LocalFile)
export class LocalFileRepository extends Repository<LocalFile> {}
