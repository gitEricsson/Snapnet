import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService } from './jwt-token.service';
import { ConfigService } from '../utils/common/config/config.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: ConfigService,
          useValue: {
            // Mock ConfigService methods used in JwtTokenService
            get: jest.fn(),
            jwtAccessSecret: 'test-secret',
            jwtRefreshSecret: 'test-refresh-secret',
            accessTokenTtl: 3600,
            refreshTokenTtl: 86400,
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            setRefreshToken: jest.fn(),
            getRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});