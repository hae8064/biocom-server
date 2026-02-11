import { ApiProperty } from '@nestjs/swagger';
import { SlotStatus } from '../entities/schedule-slot.entity';

export class SlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  counselorId: string;

  @ApiProperty({
    description: '시작 시각 (KST)',
    example: '2026-02-11T09:00:00+09:00',
  })
  startAt: string;

  @ApiProperty({
    description: '종료 시각 (KST, startAt + 30분)',
    example: '2026-02-11T09:30:00+09:00',
  })
  endAt: string;

  @ApiProperty({
    description: '정원 (고정 3명)',
    example: 3,
  })
  capacity: number;

  @ApiProperty()
  bookedCount: number;

  @ApiProperty({ enum: SlotStatus })
  status: SlotStatus;
}
