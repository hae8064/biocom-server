import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { JwtValidateResult } from '../auth/strategies/jwt.strategy';
import { ScheduleSlotsService } from './schedule-slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { SlotResponseDto } from './dto/slot-response.dto';
import { CreateSlotResponseDto } from './dto/create-slot-response.dto';
import { SlotBookingItemDto } from './dto/slot-booking-response.dto';

@ApiTags('관리자 - 슬롯 (Admin Slots)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COUNSELOR)
@Controller('admin/slots')
export class AdminSlotsController {
  constructor(private readonly slotsService: ScheduleSlotsService) {}

  @Get(':slotId/bookings')
  @ApiOperation({ summary: '슬롯 예약자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '해당 슬롯의 예약자 목록',
    type: [SlotBookingItemDto],
  })
  @ApiResponse({ status: 403, description: '권한 없음 (상담사는 본인 슬롯만)' })
  @ApiResponse({ status: 404, description: '슬롯을 찾을 수 없음' })
  async findBookings(
    @Param('slotId') slotId: string,
    @CurrentUser() user: JwtValidateResult,
  ) {
    return this.slotsService.findBookingsBySlotId(slotId, user);
  }

  @Get()
  @ApiOperation({
    summary: '슬롯 목록 조회',
    description:
      'JWT 토큰의 사용자(상담사) ID로 본인 슬롯만 조회. includeBookings=true 시 예약 목록 포함 (N+1 방지, IN batch 조회)',
  })
  @ApiResponse({
    status: 200,
    description: '슬롯 목록 (includeBookings=true 시 bookings 포함)',
    type: [SlotResponseDto],
  })
  async findAll(
    @CurrentUser() user: JwtValidateResult,
    @Query('includeBookings') includeBookings?: string,
  ) {
    const slots = await this.slotsService.findAll(
      user.userId,
      includeBookings === 'true',
    );
    return slots;
  }

  @Get(':id')
  @ApiOperation({ summary: '슬롯 단건 조회' })
  @ApiResponse({ status: 200, description: '슬롯 상세', type: SlotResponseDto })
  @ApiResponse({ status: 404, description: '슬롯을 찾을 수 없음' })
  async findOne(@Param('id') id: string) {
    const slot = await this.slotsService.findOne(id);
    return this.slotsService.formatSlotForResponse(slot);
  }

  @Post()
  @ApiOperation({ summary: '슬롯 생성' })
  @ApiResponse({
    status: 201,
    description: '슬롯 생성 완료',
    type: CreateSlotResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '동일 상담사의 해당 시작 시각 슬롯이 이미 존재함',
  })
  @ApiResponse({ status: 403, description: '권한 없음 (상담사는 본인 슬롯만)' })
  async create(
    @Body() dto: CreateSlotDto,
    @CurrentUser() user: JwtValidateResult,
  ) {
    const slot = await this.slotsService.create(dto, user);
    return {
      message: '슬롯이 생성되었습니다.',
      slot: this.slotsService.formatSlotForResponse(slot),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '슬롯 수정' })
  @ApiResponse({
    status: 200,
    description: '슬롯 수정 완료',
    type: SlotResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '동일 상담사의 해당 시작 시각 슬롯이 이미 존재함',
  })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '슬롯을 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSlotDto,
    @CurrentUser() user: JwtValidateResult,
  ) {
    const slot = await this.slotsService.update(id, dto, user);
    return this.slotsService.formatSlotForResponse(slot);
  }

  @Delete(':id')
  @ApiOperation({ summary: '슬롯 삭제' })
  @ApiResponse({ status: 200, description: '슬롯 삭제 완료' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '슬롯을 찾을 수 없음' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtValidateResult,
  ) {
    await this.slotsService.remove(id, user);
    return { message: '슬롯이 삭제되었습니다.' };
  }
}
