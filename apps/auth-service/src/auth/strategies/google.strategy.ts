import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { getConfig } from '@app/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: getConfig<string>('auth.openid.google.clientId'),
      clientSecret: getConfig<string>('auth.openid.google.clientSecret'),
      callbackURL: getConfig<string>('auth.openid.google.callbackUrl'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Get redirect_uri from state parameter
    let redirectUri: string | undefined;
    try {
      const state = req.query?.state;
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        redirectUri = stateData.redirect_uri;
      }
    } catch (error) {
      // State parsing failed, redirectUri will be undefined
    }

    const user = {
      googleId: id,
      email: emails[0].value,
      fullName: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      accessToken,
      redirectUri,
    };
    
    done(null, user);
  }
}
