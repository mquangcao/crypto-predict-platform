import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseEntityDto } from '@app/common';

export class PlanDto extends BaseEntityDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  description: string;

  @ApiProperty({ type: [String] })
  @Expose()
  features: string[];

  @ApiProperty()
  @Expose()
  monthlyPrice: number;

  @ApiProperty()
  @Expose()
  yearlyPrice: number;

  @ApiPropertyOptional()
  @Expose()
  monthlyDiscountPrice: number;

  @ApiPropertyOptional()
  @Expose()
  yearlyDiscountPrice: number;

  @ApiProperty()
  @Expose()
  isPopular: boolean;

  @ApiPropertyOptional()
  @Expose()
  tag: string;

  @ApiProperty()
  @Expose()
  cta: string;

  @ApiPropertyOptional()
  @Expose()
  href: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
