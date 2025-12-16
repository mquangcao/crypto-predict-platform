import { plainToInstance } from "class-transformer";
import { firstValueFrom } from "rxjs";

import { clientMap, operationMap, GatewayException } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientProxyFactory, MicroserviceOptions } from "@nestjs/microservices";

import { RunCommandDto, RunOperationDto } from "./dtos";

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(private readonly commandBus: CommandBus) {}

  async registerClient(
    serviceId: string,
    microserviceOptions: MicroserviceOptions
  ) {
    const client = ClientProxyFactory.create(microserviceOptions as any);
    clientMap.set(serviceId, client);
    this.logger.verbose(`Registered client: ${serviceId}`);
  }

  async registerOperation(operationId: string, command: any) {
    operationMap.set(operationId, command);
    this.logger.verbose(`Registered operation: ${operationId}`);
  }

  async runCommand(dto: RunCommandDto) {
    try {
      const command = operationMap.get(dto.operationId);
      if (!command) {
        throw new Error(`Command ${dto.operationId} not found`);
      }
      const commandDto = plainToInstance(command, dto.payload);

      this.logger.verbose(`Executing command: ${JSON.stringify(dto)}`);
      return this.commandBus.execute(commandDto);
    } catch (err) {
      this.logger.error(err);
      throw new GatewayException(err.message, JSON.stringify({ cause: err }));
    }
  }

  async runOperation<Result = unknown>(dto: RunOperationDto): Promise<Result> {
    const { serviceId } = dto;
    const client = clientMap.get(serviceId);

    if (!client) {
      throw new Error(`Client ${serviceId} not found`);
    }

    this.logger.verbose(`Executing operation: ${JSON.stringify(dto)}`);
    return firstValueFrom(client.send("gateway.runOperation", dto));
  }
}
