import { Response } from 'express';

import { ApiResponseDto, ResponseBuilder, getConfig } from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExchangeOAuthCodeDto } from '../dtos/exchange-oauth-code.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { OpenIdService } from '../services/openid.service';

@ApiTags('OpenID/OAuth')
@Controller('auth')
export class OpenIdController {
  constructor(private readonly openIdService: OpenIdService) {}

  @Get('google')
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiate Google OAuth authentication flow',
  })
  async googleAuth(@Request() req, @Res() res: Response) {
    // Encode redirect_uri into state parameter
    const redirectUri = req.query.redirect_uri;
    const state = redirectUri
      ? Buffer.from(JSON.stringify({ redirect_uri: redirectUri })).toString('base64')
      : undefined;

    const googleAuthUrl = getConfig<string>('auth.openid.google.clientId');
    const callbackUrl = getConfig<string>('auth.openid.google.callbackUrl');
    const baseUrl = `https://accounts.google.com/o/oauth2/v2/auth`;

    const params = new URLSearchParams({
      client_id: googleAuthUrl,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'email profile',
      ...(state && { state }),
    });

    return res.redirect(`${baseUrl}?${params.toString()}`);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and redirect with temporary code',
  })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const { user } = req;
    console.log("check var", JSON.stringify(user, null, 2));
    // Validate redirect_uri is provided
    if (!user.redirectUri) {
      throw new BadRequestException('redirect_uri is required for OAuth flow');
    }

    const profile = {
      providerId: user.googleId,
      provider: 'google',
      email: user.email,
      fullName: user.fullName,
      picture: user.picture,
    };

    const tempCode = await this.openIdService.createOAuthTempCode(profile);

    const redirectUrl = `${user.redirectUri}?code=${tempCode}`;

    return res.redirect(redirectUrl);
  }

  @Post('oauth/exchange')
  @ApiOperation({
    summary: 'Exchange OAuth code for tokens',
    description: 'Exchange temporary OAuth code for access and refresh tokens',
  })
  @ApiBody({ type: ExchangeOAuthCodeDto })
  @ApiOkResponse({ type: ApiResponseDto(LoginResponseDto) })
  async exchangeOAuthCode(@Body() dto: ExchangeOAuthCodeDto) {
    const loginResponse = await this.openIdService.exchangeOAuthCode(dto.code);
    return ResponseBuilder.createResponse({ data: loginResponse });
  }
}
