import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestProcessor } from './leave-request.processor';
import { LeaveRequestEntity } from './leave-request.entity';
import { RedisService } from '../redis/redis.service';
import { ProducerService } from '../job-queue/producer.service';
import { RetryService } from '../job-queue/retry.service';
import { LeaveRequestRepository } from './leave-request.repository';
import { LeaveStatus } from '../utils/common/constant/enum.constant';

describe('LeaveRequestProcessor', () => {
  let processor: LeaveRequestProcessor;
  let mockRedisService: Partial<RedisService>;
  let mockProducerService: Partial<ProducerService>;
  let mockRetryService: Partial<RetryService>;

  const mockLeaveRequestRepository = {
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    mockRedisService = {
      setNxExpire: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockProducerService = {
      publishLeaveRequested: jest.fn().mockResolvedValue(undefined),
      publishToDlq: jest.fn().mockResolvedValue(undefined),
    };

    mockRetryService = {
      handleRetry: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestProcessor,
        {
          provide: LeaveRequestRepository,
          useValue: mockLeaveRequestRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
        {
          provide: RetryService,
          useValue: mockRetryService,
        },
      ],
    }).compile();

    processor = module.get<LeaveRequestProcessor>(LeaveRequestProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleLeaveRequested', () => {
    it('should process leave request and update status to APPROVED for short leaves', async () => {
      const msg = {
        requestId: 'test-request-id',
        employeeId: 'test-employee',
        startDate: new Date('2023-01-01').toISOString(),
        endDate: new Date('2023-01-02').toISOString(), // 2 days
      };

      await processor['handleLeaveRequested'](msg as any);

      expect(mockRedisService.setNxExpire).toHaveBeenCalled();
      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalledWith(
        msg.requestId,
        LeaveStatus.APPROVED
      );
    });
  });
});
