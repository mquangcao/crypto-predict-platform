import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { GatewayService } from "./gateway.service";

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @MessagePattern("gateway.runOperation")
  async handleGatewayRunOperation(@Payload() payload: any) {
    return await this.gatewayService.runCommand(payload);
  }
}
