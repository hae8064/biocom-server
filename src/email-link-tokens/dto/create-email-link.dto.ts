import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateEmailLinkDto {
  @ApiPropertyOptional({
    description:
      '상담사 ID (선택). ADMIN은 지정 가능, COUNSELOR는 생략 시 본인으로 생성',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  counselorId?: string;

  @ApiPropertyOptional({
    description: '토큰 유효 시간(시간 단위). 기본 24시간',
    default: 24,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInHours?: number;
}
