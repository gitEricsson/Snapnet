import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { RedisService } from '../redis/redis.service';
import { UtilsService } from '../utils/utils.service';
import { BaseUserService } from '../base-user/base-user.service';
import { BaseUserRepository } from '../base-user/base-user.repository';
import { BaseUserEntity } from '../base-user/base-user.entity';
import { Role } from '../utils/common/constant/enum.constant';
import {
  CreateUserDto,
  AdminProfileDto,
  EmployeeProfileDto,
} from '../base-user/dto/base-user.dto';
import { IJwtPayload } from '../jwt-token/jwt-token.interface';
import { ProducerService } from '../job-queue/producer.service';

@Injectable()
export class AuthService {
  private static instance: AuthService;

  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
    private readonly utils: UtilsService,
    private readonly baseUserService: BaseUserService,
    private readonly baseUserRepository: BaseUserRepository,
    private readonly producer?: ProducerService
  ) {
    if (AuthService.instance) {
      return AuthService.instance;
    }
    AuthService.instance = this;
  }

  private buildCreateUserDtoFromSignup(dto: SignupDto): CreateUserDto {
    const role = dto.role ?? Role.EMPLOYEE;

    const base: CreateUserDto = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role,
    } as CreateUserDto;

    if (role === Role.EMPLOYEE && dto.departmentId) {
      (base as any).employeeProfile = {
        departmentId: dto.departmentId,
        meta: dto.profile,
      } as EmployeeProfileDto;
    }

    if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
      (base as any).adminProfile = {
        meta: dto.profile,
      } as AdminProfileDto;
    }

    return base;
  }

  async signup(dto: SignupDto) {
    const createUserDto = this.buildCreateUserDtoFromSignup(dto);
    const user = await this.baseUserService.create(createUserDto);

    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: (user as any).name,
    };

    // publish welcome email job asynchronously (best-effort)
    try {
      if (this.producer) {
        await this.producer.publishUserRegistered({
          userId: user.id,
          email: user.email,
          name: user.name,
          attempts: 0,
        });
      }
    } catch (e) {
      // don't fail signup due to messaging issues
    }

    const { accessToken, refreshToken } =
      await this.jwtTokenService.generateTokens(payload);

    return { user, accessToken, refreshToken };
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<BaseUserEntity | null> {
    const user = await this.baseUserRepository.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    const isMatch = await this.utils.compare(password, (user as any).password);
    if (!isMatch) {
      return null;
    }

    const { password: _pwd, ...safe } = user as any;
    return safe as BaseUserEntity;
  }

  async login(user: BaseUserEntity, rememberMe?: boolean) {
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: (user as any).name,
    };

    const { accessToken, refreshToken } =
      await this.jwtTokenService.generateTokens(payload, rememberMe);

    return { accessToken, refreshToken, user };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.jwtTokenService.revokeToken(userId);
    return { message: 'Logged out successfully' };
  }

  async retrieveUserFromJwt(payload: IJwtPayload): Promise<BaseUserEntity> {
    const user = await this.baseUserService.findById(payload.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
