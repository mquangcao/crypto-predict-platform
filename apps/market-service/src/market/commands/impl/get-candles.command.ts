import { ICommand } from '@nestjs/cqrs';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class GetCandlesCommand implements ICommand {
  @IsString()
  symbol: string;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
