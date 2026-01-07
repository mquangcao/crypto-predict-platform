import { TokenRole } from "../enums";
import { SetMetadata } from "@nestjs/common";

export const TOKEN_ROLE_KEY = "token_roles";
export const TokenRoles = (...roles: TokenRole[]) =>
  SetMetadata(TOKEN_ROLE_KEY, roles);
