import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicBookingsService } from './public-bookings.service';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { CreatePublicBookingResponseDto } from './dto/create-public-booking-response.dto';

@ApiTags('공개 - 예약 (Public Reserve)')
@Controller('public')
export class PublicBookingsController {
  constructor(private readonly publicBookingsService: PublicBookingsService) {}

  @Post('bookings')
  @ApiOperation({
    summary: '예약 생성',
    description:
      '토큰 검증 후 예약 생성. 트랜잭션 내 SELECT FOR UPDATE, booked_count 증가. 성공 시 token used_at 업데이트. 정원(3명) 초과 시 409.',
  })
  @ApiBody({ type: CreatePublicBookingDto })
  @ApiResponse({
    status: 201,
    description: '예약 완료',
    type: CreatePublicBookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'token 파라미터 누락' })
  @ApiResponse({ status: 401, description: '토큰 없음/만료/이미 사용됨' })
  @ApiResponse({ status: 404, description: '슬롯을 찾을 수 없음' })
  @ApiResponse({
    status: 409,
    description: '정원 초과/예약 마감/이미 예약됨',
  })
  async create(@Body() dto: CreatePublicBookingDto) {
    return this.publicBookingsService.create(dto);
  }
}
