import { MicroserviceOptions } from "@nestjs/microservices";

export type GatewayConfig = {
  services: GatewayServicesConfig;
};

export type GatewayServicesConfig = Record<string, MicroserviceOptions>;
