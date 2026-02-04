import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class DiscountPlanDto {
  @ApiPropertyOptional({ example: 30000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyDiscountPrice?: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  yearlyDiscountPrice?: number;
}
