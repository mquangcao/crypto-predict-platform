import { DynamicModule, Global, Module } from "@nestjs/common";
import { KafkaOptions } from "@nestjs/microservices";
import { KafkaService } from "./kafka.service";

@Global()
@Module({})
export class KafkaModule {
  static register(options: KafkaOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: KafkaService,
          useValue: new KafkaService(options),
        },
      ],
      exports: [KafkaService],
    };
  }
}
