import { getConfig, GatewayConfig } from "@app/common";
import { Module } from "@nestjs/common";
import { Transport } from "@nestjs/microservices";

import { GatewayModule } from "./gateway";
import { AxiosModule } from "./axios";
import { KafkaModule } from "./kafka";

const gatewayConfig = getConfig<GatewayConfig>("core.gateway");
const kafkaConfig = getConfig<any>("core.kafka");

@Module({
  imports: [
    GatewayModule.forRoot({
      services: Object.entries(gatewayConfig.services).map(
        ([serviceId, transport]) => ({
          serviceId,
          transport,
        }),
      ),
    }),
    AxiosModule.forRoot(),
    kafkaConfig
      ? KafkaModule.register({
          transport: Transport.KAFKA,
          options: {
            client: kafkaConfig.client,
            consumer: kafkaConfig.consumer,
          },
        })
      : null,
  ].filter(Boolean),
  exports: [GatewayModule, AxiosModule, KafkaModule],
})
export class CoreModule {
  static forRoot() {
    return {
      global: true,
      module: CoreModule,
    };
  }
}
