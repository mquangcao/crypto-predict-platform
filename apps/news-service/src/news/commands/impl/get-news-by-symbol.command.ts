import { BaseCommand } from '@app/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetNewsBySymbolCommand extends BaseCommand {
  @IsString()
  @IsNotEmpty()
  symbol: string;
}
