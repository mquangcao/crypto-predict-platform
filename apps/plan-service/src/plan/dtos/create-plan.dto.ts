import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'VIP Premium' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Advanced intelligence for professional edge.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['AI model analysis', 'Trade signals'] })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ example: 36000 })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 360000 })
  @IsNumber()
  @Min(0)
  yearlyPrice: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: 'Recommended' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ example: 'Go Premium' })
  @IsString()
  @IsOptional()
  cta?: string;

  @ApiPropertyOptional({ example: '/checkout' })
  @IsString()
  @IsOptional()
  href?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
