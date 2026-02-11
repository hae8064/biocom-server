import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailLinkResponseDto {
  @ApiProperty({
    description: '예약 링크 (토큰 포함)',
    example: 'https://example.com/public/reserve?token=abc123...',
  })
  link: string;

  @ApiProperty({
    description: '토큰 만료 시각 (KST ISO)',
    example: '2026-02-12T09:00:00+09:00',
  })
  expiresAt: string;
}
