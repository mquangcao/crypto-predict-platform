import { ApiResponseDto, ResponseBuilder, TokenPayload, UserSession } from '@app/common';
import { JwtAuthGuard } from '@app/core';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterRequestDto } from '../dtos/register-request.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access/refresh tokens',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async login(@Request() req) {
    const { user } = req;
    const loginResponse = await this.authService.login(user);
    return ResponseBuilder.createResponse({ data: loginResponse });
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Register new user and return access/refresh tokens',
  })
  @ApiBody({ type: RegisterRequestDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async register(@Body() registerDto: RegisterRequestDto) {
    const loginResponse = await this.authService.register(registerDto);

    return ResponseBuilder.createResponse({ data: loginResponse });
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Generate new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    await this.authService.refresh(refreshDto);
    return ResponseBuilder.createResponse({ data: null });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user', description: 'Invalidate refresh token and logout user' })
  async logout(@UserSession() user: TokenPayload) {
    await this.authService.logout(user.sub);
    return ResponseBuilder.createResponse({ message: 'Logged out successfully', data: null });
  }
}
