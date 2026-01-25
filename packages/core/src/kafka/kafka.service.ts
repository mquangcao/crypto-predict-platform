import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ClientKafka, KafkaOptions } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private client: ClientKafka;

  constructor(options: KafkaOptions) {
    this.client = new ClientKafka(options.options);
  }

  async onModuleInit() {
    const topics = [];
    await this.client.connect();
    this.logger.log("Kafka client connected");
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  /**
   * Emit an event to Kafka (Fire and forget)
   */
  async emit<T = any>(pattern: string, data: T) {
    this.logger.verbose(`Emitting event: ${pattern} - ${JSON.stringify(data)}`);
    return this.client.emit(pattern, data);
  }

  /**
   * Send a message to Kafka (Request-Response)
   */
  async send<TResult = any, TInput = any>(
    pattern: string,
    data: TInput,
  ): Promise<TResult> {
    this.logger.verbose(
      `Sending message: ${pattern} - ${JSON.stringify(data)}`,
    );
    return firstValueFrom(this.client.send<TResult, TInput>(pattern, data));
  }
}
