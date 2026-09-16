import { Test, TestingModule } from '@nestjs/testing';
import { TherapistController } from './therapist.controller.js';

describe('TherapistController', () => {
  let controller: TherapistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapistController],
    }).compile();

    controller = module.get<TherapistController>(TherapistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
