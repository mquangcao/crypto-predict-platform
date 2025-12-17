// import { GatewayService } from "@app/core";
// import { AUTH_OPERATION, SERVICE } from "../constants";
// import { IS_PUBLIC_KEY } from "../decorators";
// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Logger,
//   UnauthorizedException,
// } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly gateWayService: GatewayService
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const logger = new Logger(JwtAuthGuard.name);
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (isPublic) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       throw new UnauthorizedException("Access token is required");
//     }

//     const token = authHeader.substring(7);

//     try {
//       const payload = await this.gateWayService.runOperation({
//         serviceId: SERVICE.AUTH,
//         operationId: AUTH_OPERATION.VERIFY_ACCESS_TOKEN,
//         payload: { token },
//       });

//       request.accessTokenJWT = token;
//       request.userSession = payload;

//       return true;
//     } catch (error) {
//       logger.debug("Invalid access token:", error);
//       throw new UnauthorizedException("Invalid access token");
//     }
//   }
// }
