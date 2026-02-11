import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
import { EmailLinkTokensService } from './email-link-tokens.service';
import { CreateEmailLinkDto } from './dto/create-email-link.dto';
import { CreateEmailLinkResponseDto } from './dto/create-email-link-response.dto';

@ApiTags('관리자 - 이메일 링크 (Admin Email Links)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COUNSELOR)
@Controller('admin/email-links')
export class AdminEmailLinksController {
  constructor(
    private readonly emailLinkTokensService: EmailLinkTokensService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '예약 링크 토큰 생성',
    description:
      '토큰 생성 후 예약 링크 반환. ADMIN은 counselorId 지정 가능, COUNSELOR는 본인만.',
  })
  @ApiResponse({
    status: 201,
    description: '토큰 생성 완료',
    type: CreateEmailLinkResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '상담사 이메일이 유효하지 않음 (전송 불가)',
  })
  @ApiResponse({ status: 404, description: '상담사를 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async create(
    @Body() dto: CreateEmailLinkDto,
    @CurrentUser() user: JwtValidateResult,
  ) {
    return this.emailLinkTokensService.create(dto, user);
  }
}
