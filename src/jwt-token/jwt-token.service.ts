import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../utils/common/config/config.service';
import { RedisService } from '../redis/redis.service';
import { IJwtPayload } from './jwt-token.interface';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {}

  private get accessSecret() {
    return this.configService.get<string>('auth.jwt.accessSecret') || this.configService.jwtSecret;
  }

  private get qrSecret() {
    return this.configService.get<string>('JWT_QR_SECRET') || this.accessSecret;
  }

  async generateTokens(payload: IJwtPayload, rememberMe?: boolean) {
    const accessToken = await this.jwtService.signAsync(payload, { secret: this.accessSecret });

    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: refreshTokenExpiry,
    });

    await this.redisService.setRefreshToken(payload.userId, refreshToken);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(payload: IJwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, { secret: this.accessSecret });
    return accessToken;
  }

  async verifyToken(token: string): Promise<IJwtPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, { secret: this.accessSecret });
      return decoded as IJwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // QR token helpers
  async signQrToken<T extends Record<string, any>>(payload: T, expiresIn: number | string = '365d') {
    return this.jwtService.signAsync(payload, { secret: this.qrSecret, expiresIn: expiresIn as any });
  }

  async verifyQrToken<T extends Record<string, any> = any>(token: string): Promise<T> {
    try {
      const decoded = await this.jwtService.verifyAsync<T>(token, { secret: this.qrSecret });
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired QR token');
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken);
    // const userId = payload.sub || payload.userId;
    const userId = payload.userId;

    const existingToken = await this.redisService.getRefreshToken(userId);
    if (!existingToken || existingToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.generateAccessToken(payload);

    await this.redisService.setUserOnline(userId);

    return { accessToken: newAccessToken };
  }

  async revokeToken(userId: string) {
    await this.redisService.deleteRefreshToken(userId);
  }
}
