import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { SlotStatus } from '../entities/schedule-slot.entity';

export class UpdateSlotDto {
  @ApiPropertyOptional({
    description:
      '시작 시각 (KST). 타임존 생략 시 KST로 해석. 30분 단위. endAt은 서버에서 startAt+30분으로 자동 계산',
    example: '2025-02-15T09:00:00',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ enum: SlotStatus })
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}
