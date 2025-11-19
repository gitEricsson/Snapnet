import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../utils/common/config/config.service';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private static instance: RedisService;
  private client: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    if (RedisService.instance) {
      return RedisService.instance;
    }

    this.client = createClient({
      username: this.configService.redisUsername,
      password: this.configService.redisPassword,
      socket: {
        host: this.configService.redisHost,
        port: this.configService.redisPort,
      },
      database: this.configService.redisDb,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client
      .connect()
      .catch((err) => console.error('Redis Connection Error', err));

    RedisService.instance = this;
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
    }
  }

  async set(key: string, value: string, expireSeconds?: number) {
    if (expireSeconds) {
      await this.client.setEx(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  // Simple atomic setNX with TTL in seconds; returns true if set
  async setNxExpire(
    key: string,
    value: string,
    expireSeconds: number
  ): Promise<boolean> {
    const res = await this.client.set(key, value, {
      NX: true,
      EX: expireSeconds,
    });
    return res === 'OK';
  }

  // Atomic increment with TTL window (seconds). Sets TTL on first increment.
  async incrementWithTtl(key: string, windowSeconds: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, windowSeconds);
    }
    return count;
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh-token:${userId}`;
    await this.set(key, refreshToken, this.configService.refreshTokenTtl);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh-token:${userId}`;
    return this.get(key);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh-token:${userId}`;
    await this.delete(key);
  }

  async getCached<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setCached(
    key: string,
    value: any,
    ttl: number = this.configService.cacheTTL
  ): Promise<void> {
    const stringValue = JSON.stringify(value);
    await this.set(key, stringValue, ttl);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async getCachedDepartmentEmployees(
    departmentId: string,
    page: number,
    limit: number
  ) {
    const key = `dept:${departmentId}:employees:${page}:${limit}`;
    return this.getCached(key);
  }

  async setCachedDepartmentEmployees(
    departmentId: string,
    page: number,
    limit: number,
    data: any,
    ttl = 300
  ) {
    const key = `dept:${departmentId}:employees:${page}:${limit}`;
    await this.setCached(key, data, ttl);
  }

  async invalidateDepartmentCache(departmentId: string) {
    await this.invalidatePattern(`dept:${departmentId}:*`);
  }

  async invalidateEmployeeCache(employeeId: string) {
    const cacheKey = `employee:${employeeId}`;
    await this.delete(cacheKey);
  }

  async getCachedEmployee(id: string): Promise<any | null> {
    const cacheKey = `employee:${id}`;
    return this.getCached(cacheKey);
  }

  async setCachedEmployee(id: string, data: any, ttl = 300) {
    const cacheKey = `employee:${id}`;
    await this.setCached(cacheKey, data, ttl);
  }

  async getHealthCheckProbe() {
    return this.get('health_check_probe');
  }
}
