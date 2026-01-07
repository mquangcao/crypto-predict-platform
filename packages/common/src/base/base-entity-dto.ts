import { Expose } from "class-transformer";
import { IsUUID } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { BaseEntity } from "./base-entity";

export abstract class BaseEntityDto extends BaseEntity {
  @ApiProperty({
    example: "uuid",
    description: "The unique identifier",
  })
  @IsUUID()
  @Expose()
  declare id: string;

  @ApiProperty({
    example: "2025-01-01T00:00:00.000Z",
    description: "The date and time when the entity was created",
  })
  @Expose()
  declare readonly createdAt: Date;

  @ApiProperty({
    example: "2025-01-01T00:00:00.000Z",
    description: "The date and time when the entity was last updated",
  })
  @Expose()
  declare readonly updatedAt: Date;

  @ApiProperty({
    example: "2025-01-01T00:00:00.000Z",
    description: "The date and time when the entity was last deleted",
  })
  @Expose()
  declare readonly deletedAt: Date;
}
