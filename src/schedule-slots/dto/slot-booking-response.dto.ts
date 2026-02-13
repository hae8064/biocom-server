import { ApiProperty } from '@nestjs/swagger';

export class SlotBookingApplicantDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  phone: string | null;
}

export class SlotBookingItemDto {
  @ApiProperty({ description: '예약 ID' })
  id: string;

  @ApiProperty({
    type: SlotBookingApplicantDto,
    description: '신청자 정보',
  })
  applicant: SlotBookingApplicantDto;

  @ApiProperty({
    description: '예약 생성 시각 (KST)',
    example: '2026-02-13T12:30:00+09:00',
  })
  createdAt: string;
}

export type SlotBookingsResponseDto = SlotBookingItemDto[];
