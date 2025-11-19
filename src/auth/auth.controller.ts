import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { BaseUserEntity } from '../base-user/base-user.entity';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../utils/common/constant/enum.constant';


@ApiTags('Auth') 
@ApiBearerAuth('accessToken')
@Controller('auth')
export class AuthController {
  private static instance: AuthController;

  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService
  ) {
    if (AuthController.instance) {
      return AuthController.instance;
    }
    AuthController.instance = this;
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: BaseUserEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. Invalid input data.',
  })
  async register(
    @Body() signupDto: SignupDto,
  ): Promise<{ message: string; user: BaseUserEntity; accessToken: string; refreshToken: string }> {
    const { user, accessToken, refreshToken } = await this.authService.signup(signupDto);
    return { message: 'User registered.', user, accessToken, refreshToken };
  }

  // Add role protection to logout and refresh token endpoints
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE) // All authenticated users can log out
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logged out' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async logout(@Request() req) {
    await this.authService.logout(req.user);
    return { message: 'Successfully logged out' };
  }


  /**
   * Login with email and password
   * Uses LocalStrategy (passport-local) for authentication
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Log in a user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    schema: {
      properties: {
        message: { type: 'string', example: 'Login successful' },
        accessToken: { type: 'string', example: 'eyJ...' },
        refreshToken: { type: 'string', example: 'eyJ...' },
        user: { $ref: '#/components/schemas/UserEntity' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async login(
    @Request() req,
    @Body() body?: { rememberMe?: boolean },
  ): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: BaseUserEntity;
  }> {
    const loginResult = await this.authService.login(req.user, body?.rememberMe);
    return {
      message: 'Login successful',
      ...loginResult,
    };
  }


  /**
   * Refresh JWT token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token using refresh token' })
  @ApiBody({
    schema: {
      properties: {
        refreshToken: { type: 'string', example: 'eyJ...' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Token refreshed successfully' },
        accessToken: { type: 'string', example: 'eyJ...' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(@Body() body: { refreshToken: string }): Promise<{
    message: string;
    accessToken: string;
  }> {
    // Use JwtTokenService to refresh the token
    const result = await this.jwtTokenService.refreshToken(body.refreshToken);
    return {
      message: 'Token refreshed successfully',
      ...result,
    };
  }
}
