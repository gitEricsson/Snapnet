import { LeaveRequestProcessor } from './leave-request.processor';
import { LeaveRequestRepository } from './leave-request.repository';
import { RedisService } from '../redis/redis.service';
import { ProducerService } from '../job-queue/producer.service';
import { RetryService } from '../job-queue/retry.service';
import { LeaveStatus, Role } from '../utils/common/constant/enum.constant';

describe('LeaveRequestProcessor (unit)', () => {
  let processor: LeaveRequestProcessor;
  const mockRepo: Partial<LeaveRequestRepository> = {
    updateStatus: jest.fn().mockResolvedValue(null),
  };
  const mockRedis: Partial<RedisService> = {
    setNxExpire: jest.fn().mockResolvedValue(true),
  };
  const mockProducer: Partial<ProducerService> = {
    publishLeaveRequested: jest.fn().mockResolvedValue(undefined),
    publishToDlq: jest.fn().mockResolvedValue(undefined),
  };
  const mockRetry: Partial<RetryService> = {
    handleRetry: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    processor = new LeaveRequestProcessor(
      mockRepo as LeaveRequestRepository,
      mockRedis as RedisService,
      mockProducer as ProducerService,
      mockRetry as RetryService
    );
  });

  it('approves leave automatically for <= 2 days', async () => {
    const msg = {
      requestId: 'r1',
      employeeId: 'e1',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(), // same day -> 1 day
    };

    await processor['handleLeaveRequested'](msg as any);

    expect(mockRedis.setNxExpire).toHaveBeenCalledWith(
      `leave:processed:${msg.requestId}`,
      '1',
      60 * 60
    );
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(
      msg.requestId,
      LeaveStatus.APPROVED
    );
    expect(mockProducer.publishLeaveRequested).toHaveBeenCalled();
  });

  it('marks leave as PENDING_APPROVAL for > 2 days', async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
    const msg = {
      requestId: 'r2',
      employeeId: 'e2',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    await processor['handleLeaveRequested'](msg as any);

    expect(mockRepo.updateStatus).toHaveBeenCalledWith(
      msg.requestId,
      LeaveStatus.PENDING_APPROVAL
    );
    expect(mockProducer.publishLeaveRequested).toHaveBeenCalled();
  });

  it('is idempotent: skips when redis key exists', async () => {
    (mockRedis.setNxExpire as jest.Mock).mockResolvedValueOnce(false);
    const msg = {
      requestId: 'r3',
      employeeId: 'e3',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };

    await processor['handleLeaveRequested'](msg as any);

    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockProducer.publishLeaveRequested).not.toHaveBeenCalled();
  });
});
