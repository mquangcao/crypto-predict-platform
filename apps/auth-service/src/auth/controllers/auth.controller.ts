import { ApiResponseDto, ResponseBuilder, TokenPayload } from '@app/common';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
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

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Generate new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const refreshResponse = await this.authService.refresh(refreshDto);
    return ResponseBuilder.createResponse({ data: refreshResponse });
  }

  //   @Post('logout')
  //   @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @ApiOperation({ summary: 'Logout user', description: 'Invalidate refresh token and logout user' })
  //   async logout(@UserSession() user: TokenPayload) {
  //     await this.authService.logout(user.sub);
  //     return ResponseBuilder.createResponse({ message: 'Logged out successfully', data: null });
  //   }
}
