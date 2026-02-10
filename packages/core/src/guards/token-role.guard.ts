import { Observable } from "rxjs";

import {
  IS_PUBLIC_KEY,
  TOKEN_ROLE_KEY,
  TokenRole,
  SERVICE,
  SUBSCRIPTION_OPERATION,
} from "@app/common";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GatewayService } from "../gateway";

@Injectable()
export class TokenRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly gatewayService: GatewayService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<TokenRole[]>(
      TOKEN_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.userSession;

    if (!user) {
      throw new UnauthorizedException("User session not found");
    }

    // Check if VIP is required and handle it
    if (requiredRoles.includes(TokenRole.VIP)) {
      if (user.tokenRole === TokenRole.ADMIN) {
        return true;
      }

      try {
        const isVip = await this.gatewayService.runOperation<boolean>({
          serviceId: SERVICE.SUBSCRIPTION,
          operationId: SUBSCRIPTION_OPERATION.CHECK_VIP,
          payload: { userId: user.sub },
        });

        if (isVip) {
          return true;
        } else {
          throw new UnauthorizedException("VIP subscription required");
        }
      } catch (error) {
        throw new UnauthorizedException(
          error.message || "VIP subscription required"
        );
      }
    }

    if (!user.tokenRole || !requiredRoles.includes(user.tokenRole)) {
      throw new UnauthorizedException("Permission denied");
    }

    return true;
  }
}
