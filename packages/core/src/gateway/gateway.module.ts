import { randomString } from "@app/common";
import { Module, Provider, Type } from "@nestjs/common";
import { CqrsModule, ICommand } from "@nestjs/cqrs";
import { MicroserviceOptions } from "@nestjs/microservices";

import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";

type GatewayRoutingConfig = {
  services: ServiceConfig[];
};

type ServiceConfig = {
  serviceId: string;
  transport: MicroserviceOptions;
};

@Module({
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {
  static forRoot(config: GatewayRoutingConfig) {
    const RegisteredClients: Provider = {
      provide: "RegisteredClients",
      useFactory: async (gatewayService: GatewayService) => {
        return config.services.map((service) => {
          return gatewayService.registerClient(
            service.serviceId,
            service.transport
          );
        });
      },
      inject: [GatewayService],
    };

    return {
      global: true,
      module: GatewayModule,
      imports: [CqrsModule],
      controllers: [GatewayController],
      providers: [GatewayService, RegisteredClients],
      exports: [GatewayService, CqrsModule, RegisteredClients],
    };
  }

  static forFeature(operations: Record<string, Type<ICommand>>) {
    const RegisteredOperations: Provider = {
      provide: "REGISTERED_OPERATION_" + randomString(6),
      useFactory: (gatewayService: GatewayService) => {
        return Object.entries(operations).map(([operationId, command]) => {
          gatewayService.registerOperation(operationId, command);
        });
      },
      inject: [GatewayService],
    };

    return {
      module: GatewayModule,
      providers: [RegisteredOperations],
      exports: [RegisteredOperations],
    };
  }
}
