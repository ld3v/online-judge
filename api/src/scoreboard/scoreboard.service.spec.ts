import { Test, TestingModule } from '@nestjs/testing';
import { ScoreboardService } from './scoreboard.service';

describe('ScoreboardService', () => {
  let service: ScoreboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoreboardService],
    }).compile();

    service = module.get<ScoreboardService>(ScoreboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
