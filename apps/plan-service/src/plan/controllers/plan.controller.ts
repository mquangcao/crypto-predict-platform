import { plainToInstance } from 'class-transformer';
import { ApiResponseDto, ResponseBuilder } from '@app/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlanService } from '../services/plan.service';
import { PlanDto } from '../dtos/plan.dto';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
import { DiscountPlanDto } from '../dtos/discount-plan.dto';

@ApiTags('Plans')
@Controller({
  path: 'plans',
  version: '1',
})
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active plans' })
  @ApiOkResponse({
    type: ApiResponseDto([PlanDto]),
    description: 'Return all active plans',
  })
  async getAllActive() {
    const plans = await this.planService.findAllActive();
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plans, { excludeExtraneousValues: true }),
    });
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all plans (including inactive)' })
  @ApiOkResponse({
    type: ApiResponseDto([PlanDto]),
    description: 'Return all plans',
  })
  async getAll() {
    const plans = await this.planService.findAll();
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plans, { excludeExtraneousValues: true }),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiOkResponse({
    type: ApiResponseDto(PlanDto),
    description: 'Return plan details',
  })
  async getById(@Param('id') id: string) {
    const plan = await this.planService.findById(id);
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plan, { excludeExtraneousValues: true }),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiOkResponse({
    type: ApiResponseDto(PlanDto),
    description: 'Return created plan',
  })
  async create(@Body() dto: CreatePlanDto) {
    const plan = await this.planService.create(dto);
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plan, { excludeExtraneousValues: true }),
      message: 'Plan created successfully',
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update plan' })
  @ApiOkResponse({
    type: ApiResponseDto(PlanDto),
    description: 'Return updated plan',
  })
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    const plan = await this.planService.update(id, dto);
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plan, { excludeExtraneousValues: true }),
      message: 'Plan updated successfully',
    });
  }

  @Patch(':id/discount')
  @ApiOperation({ summary: 'Apply discount to plan' })
  @ApiOkResponse({
    type: ApiResponseDto(PlanDto),
    description: 'Return plan with discount applied',
  })
  async applyDiscount(@Param('id') id: string, @Body() dto: DiscountPlanDto) {
    const plan = await this.planService.applyDiscount(id, dto);
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plan, { excludeExtraneousValues: true }),
      message: 'Discount applied successfully',
    });
  }

  @Delete(':id/discount')
  @ApiOperation({ summary: 'Remove discount from plan' })
  @ApiOkResponse({
    type: ApiResponseDto(PlanDto),
    description: 'Return plan with discount removed',
  })
  async removeDiscount(@Param('id') id: string) {
    const plan = await this.planService.removeDiscount(id);
    return ResponseBuilder.createResponse({
      data: plainToInstance(PlanDto, plan, { excludeExtraneousValues: true }),
      message: 'Discount removed successfully',
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete plan (set isActive to false)' })
  @ApiOkResponse({
    description: 'Plan deactivated successfully',
  })
  async softDelete(@Param('id') id: string) {
    await this.planService.softDelete(id);
    return ResponseBuilder.createResponse({
      data: null,
      message: 'Plan deactivated successfully',
    });
  }
}
