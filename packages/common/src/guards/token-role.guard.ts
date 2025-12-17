import { Observable } from "rxjs";

import { IS_PUBLIC_KEY, TOKEN_ROLE_KEY } from "../decorators";
import { TokenRole } from "../enums";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TokenRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<TokenRole[]>(
      TOKEN_ROLE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.userSession;

    if (!user || !user.tokenRole || !requiredRoles.includes(user.tokenRole)) {
      throw new UnauthorizedException("Permission denied");
    }

    return true;
  }
}
