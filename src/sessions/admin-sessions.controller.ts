import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SaveSessionResponseDto } from './dto/save-session-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@ApiTags('관리자 - 상담 기록 (Admin Sessions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COUNSELOR)
@Controller('admin/bookings')
export class AdminSessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(':bookingId/session')
  @ApiOperation({
    summary: '상담 기록 조회',
    description:
      '예약에 대한 상담 기록 조회. 상담사는 본인 슬롯의 예약만 가능.',
  })
  @ApiResponse({
    status: 200,
    description: '상담 기록',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 403, description: '권한 없음 (상담사는 본인 슬롯만)' })
  @ApiResponse({
    status: 404,
    description: '예약 또는 상담 기록을 찾을 수 없음',
  })
  async getSession(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: JwtValidateResult,
  ) {
    return this.sessionsService.getSessionByBookingId(bookingId, user);
  }

  @Post(':bookingId/session')
  @ApiOperation({
    summary: '상담 기록 저장',
    description:
      '예약에 대한 상담 기록 저장. booking_id당 1건만 존재 (업서트). 상담사는 본인 슬롯의 예약만 가능.',
  })
  @ApiResponse({
    status: 201,
    description: '상담 기록 저장 완료',
    type: SaveSessionResponseDto,
  })
  @ApiResponse({ status: 403, description: '권한 없음 (상담사는 본인 슬롯만)' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async saveSession(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: JwtValidateResult,
  ) {
    return this.sessionsService.saveSessionByBookingId(bookingId, dto, user);
  }
}
