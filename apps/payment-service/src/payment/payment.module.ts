import { DynamicModule, Module, type Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PAYMENT_STRATEGIES } from './constants';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { BasePaymentStrategy } from './strategies';
import { MomoPaymentStrategy } from './strategies/momo.strategy';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { PaymentLogEntity } from './entities/payment-log.entity';
import { PaymentCallbackEntity } from './entities/payment-callback.entity';

export interface PaymentModuleOptions {
  strategies?: Provider<BasePaymentStrategy>[];
}

@Module({})
export class PaymentModule {
  static forRoot(options: PaymentModuleOptions = {}): DynamicModule {
    const strategies = options.strategies || [
      MomoPaymentStrategy,
    ];

    return {
      module: PaymentModule,
      imports: [
        TypeOrmModule.forFeature([
          PaymentTransactionEntity,
          PaymentLogEntity,
          PaymentCallbackEntity,
        ]),
      ],
      controllers: [PaymentController],
      providers: [
        PaymentService,
        MomoPaymentStrategy,
        {
          provide: PAYMENT_STRATEGIES,
          useFactory: (...strategies: BasePaymentStrategy[]) => strategies,
          inject: [...(strategies as any)],
        },
      ],
      exports: [
        TypeOrmModule,
        PAYMENT_STRATEGIES,
        PaymentService,
        MomoPaymentStrategy,
      ],
    };
  }

  static forFeature(strategies: any[]): DynamicModule {
    return {
      module: PaymentModule,
      providers: [...strategies],
      exports: [...strategies],
    };
  }
}