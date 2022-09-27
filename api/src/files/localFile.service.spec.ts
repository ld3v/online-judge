import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileService } from './localFile.service';

describe('FilesService', () => {
  let service: LocalFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalFileService],
    }).compile();

    service = module.get<LocalFileService>(LocalFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
