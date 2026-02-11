import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { isEmail } from 'class-validator';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailLinkToken } from './entities/email-link-token.entity';
import { CreateEmailLinkDto } from './dto/create-email-link.dto';
import { formatDateToKst } from '../schedule-slots/slot.utils';
import { MailService } from '../mail/mail.service';
import type { JwtValidateResult } from '../auth/strategies/jwt.strategy';

const DEFAULT_EXPIRES_HOURS = 24;

@Injectable()
export class EmailLinkTokensService {
  constructor(
    @InjectRepository(EmailLinkToken)
    private readonly tokenRepository: Repository<EmailLinkToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async create(
    dto: CreateEmailLinkDto,
    user: JwtValidateResult,
  ): Promise<{ link: string; expiresAt: string }> {
    const counselorId = dto.counselorId ?? user.userId;

    if (user.role === UserRole.COUNSELOR && counselorId !== user.userId) {
      throw new ForbiddenException(
        '상담사는 본인만을 위한 링크만 생성할 수 있습니다.',
      );
    }

    const counselor = await this.userRepository.findOne({
      where: { id: counselorId },
    });
    if (!counselor) {
      throw new NotFoundException('상담사를 찾을 수 없습니다.');
    }

    if (!isEmail(counselor.email)) {
      throw new BadRequestException(
        '상담사 이메일이 유효하지 않아 링크를 전송할 수 없습니다.',
      );
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresInHours = dto.expiresInHours ?? DEFAULT_EXPIRES_HOURS;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const record = this.tokenRepository.create({
      counselorId,
      tokenHash,
      expiresAt,
    });
    await this.tokenRepository.save(record);

    const baseUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const link = `${baseUrl.replace(/\/$/, '')}/public/reserve?token=${rawToken}`;

    // 실제 메일 발송
    await this.mailService.sendReservationLink(counselor.email, link);

    return {
      link,
      expiresAt: formatDateToKst(expiresAt),
    };
  }
}
