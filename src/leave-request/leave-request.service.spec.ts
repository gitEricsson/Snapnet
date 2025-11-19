import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestEntity } from './leave-request.entity';
import { EmployeeEntity } from '../employee/employee.entity';
import { LeaveRequestRepository } from './leave-request.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { ProducerService } from '../job-queue/producer.service';
import { LeaveStatus } from '../utils/common/constant/enum.constant';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;
  let leaveRequestRepository: jest.Mocked<LeaveRequestRepository>;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let producerService: jest.Mocked<ProducerService>;

  const mockLeaveRequest = {
    id: 'test-id',
    employeeId: 'test-employee',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-02'),
    status: LeaveStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestService,
        {
          provide: LeaveRequestRepository,
          useValue: {
            create: jest.fn().mockReturnValue(mockLeaveRequest),
            save: jest.fn().mockResolvedValue(mockLeaveRequest),
            hasDateConflict: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: EmployeeRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'test-employee',
              name: 'Test Employee',
            }),
          },
        },
        {
          provide: ProducerService,
          useValue: {
            publishLeaveRequested: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LeaveRequestService>(LeaveRequestService);
    leaveRequestRepository = module.get(LeaveRequestRepository);
    employeeRepository = module.get(EmployeeRepository);
    producerService = module.get(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request', async () => {
      const createLeaveRequestDto = {
        employeeId: 'test-employee',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-02'),
        status: LeaveStatus.PENDING,
      };

      const result = await service.createLeaveRequest(createLeaveRequestDto);

      expect(result).toBeDefined();
      expect(employeeRepository.findById).toHaveBeenCalledWith(createLeaveRequestDto.employeeId);
      expect(leaveRequestRepository.hasDateConflict).toHaveBeenCalled();
      expect(leaveRequestRepository.create).toHaveBeenCalled();
      expect(producerService.publishLeaveRequested).toHaveBeenCalled();
    });
  });
});