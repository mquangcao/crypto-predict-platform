import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  planId: string;

  @ApiProperty()
  @Expose()
  planName: string;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
