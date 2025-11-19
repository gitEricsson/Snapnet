import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { LeaveRequestController } from '../src/leave-request/leave-request.controller';
import { LeaveRequestService } from '../src/leave-request/leave-request.service';
import { LeaveRequestRepository } from '../src/leave-request/leave-request.repository';
import { EmployeeRepository } from '../src/employee/employee.repository';
import { ProducerService } from '../src/job-queue/producer.service';
import { APP_GUARD } from '@nestjs/core';
import { CanActivate, ExecutionContext } from '@nestjs/common';

class AllowAllGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.user = { id: 'u1', role: 'admin', employeeId: 'e1' };
    return true;
  }
}

describe('LeaveRequestController (e2e)', () => {
  let app: INestApplication;
  const mockEmployeeRepo: Partial<EmployeeRepository> = {
    findById: jest.fn().mockResolvedValue({ id: 'e1' }),
  };
  const mockLeaveRepo: Partial<LeaveRequestRepository> = {
    create: jest.fn().mockImplementation((p) => ({ ...p, id: 'lr1' })),
    save: jest
      .fn()
      .mockImplementation(async (entity) => ({ ...entity, id: 'lr1' })),
    hasDateConflict: jest.fn().mockResolvedValue(false),
  };
  const mockProducer = {
    publishLeaveRequested: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LeaveRequestController],
      providers: [
        LeaveRequestService,
        { provide: LeaveRequestRepository, useValue: mockLeaveRepo },
        { provide: EmployeeRepository, useValue: mockEmployeeRepo },
        { provide: ProducerService, useValue: mockProducer },
        { provide: APP_GUARD, useClass: AllowAllGuard }, // bypass auth/roles
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/leave-requests publishes leave.requested', async () => {
    const payload = {
      employeeId: 'e1',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'PENDING',
    };

    const res = await request(app.getHttpServer())
      .post('/api/leave-requests')
      .send(payload)
      .expect(201);

    expect(res.body.statusCode).toBe(201);
    expect(mockProducer.publishLeaveRequested).toHaveBeenCalled();
    expect(mockLeaveRepo.create).toHaveBeenCalled();
    expect(mockLeaveRepo.save).toHaveBeenCalled();
  });
});
