import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionOutcome } from '../entities/session.entity';

export class CreateSessionDto {
  @ApiPropertyOptional({ description: '상담 메모' })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    description: '상담 결과',
    enum: SessionOutcome,
    example: SessionOutcome.COMPLETED,
  })
  @IsOptional()
  @IsEnum(SessionOutcome)
  outcome?: SessionOutcome | null;
}
