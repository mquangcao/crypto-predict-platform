import { ICommand } from '@nestjs/cqrs';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GetCandlesCommand implements ICommand {
  @IsString()
  symbol: string;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
