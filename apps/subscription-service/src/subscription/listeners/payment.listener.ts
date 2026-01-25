import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { PAYMENT_EVENT } from "@app/common";
import { SubscriptionService } from "../services/subscription.service";

@Controller()
export class PaymentListener {
  private readonly logger = new Logger(PaymentListener.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @MessagePattern(PAYMENT_EVENT.PAYMENT_SUCCESS)
  async handlePaymentSuccess(@Payload() data: any) {
    this.logger.log(`Received payment success event: ${JSON.stringify(data)}`);
    
    try {
      const { userId, planId, planName, interval, metadata } = data;
      
      await this.subscriptionService.createOrExtendSubscription({
        userId,
        planId,
        planName,
        interval,
        metadata: {
          ...metadata,
          transactionId: data.transactionId,
          orderId: data.orderId,
        }
      });

      this.logger.log(`Subscription updated for user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to update subscription for user ${data.userId}`, err);
    }
  }
}
