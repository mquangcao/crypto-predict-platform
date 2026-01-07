import { TokenService } from 'src/auth/services/token.service';

import { TokenPayload } from '@app/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VerifyAccessTokenCommand } from '../impl';

@CommandHandler(VerifyAccessTokenCommand)
export class VerifyAccessTokenHandler implements ICommandHandler<VerifyAccessTokenCommand> {
  constructor(private readonly tokenService: TokenService) {}

  async execute(command: VerifyAccessTokenCommand): Promise<TokenPayload> {
    return this.tokenService.verifyAccessToken(command.token);
  }
}
