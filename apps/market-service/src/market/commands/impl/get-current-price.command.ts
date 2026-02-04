import { ICommand } from '@nestjs/cqrs';
import { IsString } from 'class-validator';

export class GetCurrentPriceCommand implements ICommand {
  @IsString()
  symbol: string;
}
