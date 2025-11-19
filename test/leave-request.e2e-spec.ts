import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { LeaveRequestModule } from '../src/leave-request/leave-request.module';
import { EmployeeEntity } from '../src/employee/employee.entity';
import { LeaveRequestEntity } from '../src/leave-request/leave-request.entity';
import { testDbConfig } from './test/typeorm.config';
import { LeaveStatus } from '../src/utils/common/constant/enum.constant';

describe('LeaveRequest (e2e)', () => {
  let app: INestApplication;
  const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...testDbConfig,
          entities: [LeaveRequestEntity, EmployeeEntity],
        }),
        LeaveRequestModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      // .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/leave-requests (POST) - should create a leave request', async () => {
    const leaveRequestData = {
      employeeId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      status: LeaveStatus.PENDING,
    };

    const response = await request(app.getHttpServer())
      .post('/leave-requests')
      .set('Authorization', 'Bearer test-token') // Add auth header
      .send(leaveRequestData)
      .expect(201);

    expect(response.body).toHaveProperty('data.id');
    expect(response.body.data.status).toBe('PENDING');
  });
});