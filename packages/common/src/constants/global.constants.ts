import { Type } from "@nestjs/common";
import { ICommand } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";

export const clientMap = new Map<string, ClientProxy>();
export const operationMap = new Map<string, Type<ICommand>>();

export const ERROR_CODE = {
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
};
