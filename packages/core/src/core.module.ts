import { getConfig, GatewayConfig } from "@app/common";
import { Module } from "@nestjs/common";

import { GatewayModule } from "./gateway";

const gatewayConfig = getConfig<GatewayConfig>("core.gateway");

@Module({
  imports: [
    GatewayModule.forRoot({
      services: Object.entries(gatewayConfig.services).map(
        ([serviceId, transport]) => ({
          serviceId,
          transport,
        })
      ),
    }),
  ],
  exports: [GatewayModule],
})
export class CoreModule {
  static forRoot() {
    return {
      global: true,
      module: CoreModule,
    };
  }
}
