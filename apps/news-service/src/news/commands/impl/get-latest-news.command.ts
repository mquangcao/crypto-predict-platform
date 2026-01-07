import { BaseCommand } from '@app/common';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetLatestNewsCommand extends BaseCommand {
  @IsNumber()
  @IsOptional()
  limit?: number = 50;
}
