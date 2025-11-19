import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { BaseUserRepository } from "./base-user.repository";
import { CreateUserDto, UpdateUserDto } from "./dto/base-user.dto";
import { Role } from "../utils/common/constant/enum.constant";
import { UtilsService } from "../utils/utils.service";
import { RedisService } from "../redis/redis.service";
import { BaseUserEntity } from "./base-user.entity";

@Injectable()
export class BaseUserService {
  private static instance: BaseUserService; // Explicit singleton instance

  constructor(
    private readonly baseUserRepository: BaseUserRepository,
    private readonly redisService: RedisService,
    private readonly utils: UtilsService,
  ) {
    if (BaseUserService.instance) {
      return BaseUserService.instance;
    }
    BaseUserService.instance = this;
  }

  async create(createUserDto: CreateUserDto): Promise<BaseUserEntity> {
    const existingUser = await this.baseUserRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException("User with this email already exists.");
    }

    const hashedPassword = await this.utils.hash(createUserDto.password);


    const user = await this.baseUserRepository.createWithProfiles({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return result as BaseUserEntity;
  }

  async findAll(): Promise<BaseUserEntity[]> {
    const users = await this.baseUserRepository.findAll();
    return users.map((user) => {
      const { password, ...result } = user;
      return result as BaseUserEntity;
    });
  }

  async findById(id: string): Promise<BaseUserEntity> {
    // Try to get from cache first
    const cachedUser = await this.redisService.get(`user:${id}`);
    if (cachedUser) {
      return JSON.parse(cachedUser) as BaseUserEntity;
    }

    // If not in cache, fetch from database
    const user = await this.baseUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const { password, ...result } = user;

    // Cache the user data (without password) for 1 hour
    await this.redisService.set(`user:${id}`, JSON.stringify(result), 3600);

    return result as BaseUserEntity;
  }

  async findByEmail(email: string): Promise<BaseUserEntity | null> {
    return this.baseUserRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<BaseUserEntity> {
    if (updateUserDto.password) {
      updateUserDto.password = await this.utils.hash(updateUserDto.password);
    }

    const oldUser = await this.baseUserRepository.findById(id);
    const updatedUser = await this.baseUserRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const { password, ...result } = updatedUser;

    // Clear and update cache
    await this.redisService.delete(`user:${id}`);
    await this.redisService.set(`user:${id}`, JSON.stringify(result), 3600);

    return result as BaseUserEntity;
  }

  async delete(id: string): Promise<BaseUserEntity> {
    // Implement transaction for cascade deletion of related profiles if needed
    const deletedUser = await this.baseUserRepository.delete(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const { password, ...result } = deletedUser;

    // Clear cache
    await this.redisService.delete(`user:${id}`);
    await this.redisService.deleteRefreshToken(id);

    return result as BaseUserEntity;
  }

}
