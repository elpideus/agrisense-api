import { HarvestsService } from './harvests.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsController } from './harvests.controller';

describe('HarvestsController', () => {
  let controller: HarvestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: HarvestsService, useValue: {} }],
      controllers: [HarvestsController],
    }).compile();

    controller = module.get<HarvestsController>(HarvestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
