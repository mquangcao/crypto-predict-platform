import type { TokenRole } from "../enums";

export interface TokenPayload {
  sub: string;
  tokenRole: TokenRole;
  iat?: number;
  exp?: number;
}
