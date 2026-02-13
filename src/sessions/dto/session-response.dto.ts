import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionOutcome } from '../entities/session.entity';

export class SessionResponseDto {
  @ApiProperty({ description: '세션 ID' })
  id: string;

  @ApiProperty({ description: '예약 ID' })
  bookingId: string;

  @ApiPropertyOptional({ description: '상담 메모', nullable: true })
  notes: string | null;

  @ApiPropertyOptional({
    description: '상담 결과',
    enum: SessionOutcome,
    nullable: true,
  })
  outcome: SessionOutcome | null;

  @ApiPropertyOptional({
    description: '상담 시작 시각 (KST)',
    example: '2026-02-13T09:00:00+09:00',
    nullable: true,
  })
  startedAt: string | null;

  @ApiPropertyOptional({
    description: '상담 종료 시각 (KST)',
    example: '2026-02-13T09:30:00+09:00',
    nullable: true,
  })
  endedAt: string | null;
}
