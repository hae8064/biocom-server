import { ApiProperty } from '@nestjs/swagger';
import { SessionResponseDto } from './session-response.dto';

export class SaveSessionResponseDto {
  @ApiProperty({ example: '상담 기록이 저장되었습니다.' })
  message: string;

  @ApiProperty({ type: SessionResponseDto })
  session: SessionResponseDto;
}
