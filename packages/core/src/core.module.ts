import { getConfig, GatewayConfig } from "@app/common";
import { Module } from "@nestjs/common";

import { GatewayModule } from "./gateway";
import { AxiosModule } from "./axios";

const gatewayConfig = getConfig<GatewayConfig>("core.gateway");

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
  ],
  exports: [GatewayModule, AxiosModule],
})
export class CoreModule {
  static forRoot() {
    return {
      global: true,
      module: CoreModule,
    };
  }
}
