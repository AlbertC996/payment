import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ChangellyService } from './changelly.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ChangellyService,
          useValue: {
            initiatePayment: jest.fn(),
            checkPaymentStatus: jest.fn(),
            simulateWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
