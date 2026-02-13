import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Applicant } from '../../applicants/entities/applicant.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { EmailLinkToken } from '../../email-link-tokens/entities/email-link-token.entity';
import {
  ScheduleSlot,
  SlotStatus,
} from '../../schedule-slots/entities/schedule-slot.entity';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';

const SLOT_CAPACITY = 3;

@Injectable()
export class PublicBookingsService {
  constructor(
    @InjectRepository(EmailLinkToken)
    private readonly tokenRepository: Repository<EmailLinkToken>,
    @InjectRepository(ScheduleSlot)
    private readonly slotRepository: Repository<ScheduleSlot>,
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(
    dto: CreatePublicBookingDto,
  ): Promise<{ message: string; bookingId: string }> {
    const tokenRecord = await this.validateToken(dto.token);

    let applicant = await this.applicantRepository.findOne({
      where: { email: dto.email },
    });
    if (!applicant) {
      applicant = this.applicantRepository.create({
        email: dto.email,
        name: dto.name,
        phone: dto.phone ?? null,
      });
      applicant = await this.applicantRepository.save(applicant);
    }

    return this.slotRepository.manager.transaction(
      async (manager): Promise<{ message: string; bookingId: string }> => {
        const slot = await manager
          .getRepository(ScheduleSlot)
          .createQueryBuilder('slot')
          .setLock('pessimistic_write')
          .where('slot.id = :id', { id: dto.slotId })
          .getOne();

        if (!slot) {
          throw new NotFoundException('슬롯을 찾을 수 없습니다.');
        }
        if (slot.counselorId !== tokenRecord.counselorId) {
          throw new UnauthorizedException(
            '해당 토큰으로 이 슬롯을 예약할 수 없습니다.',
          );
        }
        if (slot.status !== SlotStatus.OPEN) {
          throw new ConflictException('예약이 마감된 슬롯입니다.');
        }
        const slotStart =
          slot.startAt instanceof Date ? slot.startAt : new Date(slot.startAt);
        if (slotStart.getTime() < Date.now()) {
          throw new ConflictException('이미 지난 슬롯은 예약할 수 없습니다.');
        }
        if (slot.bookedCount >= SLOT_CAPACITY) {
          throw new ConflictException(
            `정원이 초과되었습니다. (최대 ${SLOT_CAPACITY}명)`,
          );
        }

        const existingBooking = await manager.getRepository(Booking).findOne({
          where: {
            slot: { id: dto.slotId },
            applicant: { id: applicant.id },
          },
        });
        if (existingBooking) {
          throw new ConflictException('이미 해당 슬롯에 예약되어 있습니다.');
        }

        const booking = manager.getRepository(Booking).create({
          slot: { id: dto.slotId },
          applicant: { id: applicant.id },
        });
        const saved = await manager.getRepository(Booking).save(booking);

        await manager
          .getRepository(ScheduleSlot)
          .increment({ id: dto.slotId }, 'bookedCount', 1);

        await manager
          .getRepository(EmailLinkToken)
          .update({ id: tokenRecord.id }, { usedAt: new Date() });

        return {
          message: '예약이 완료되었습니다.',
          bookingId: saved.id,
        };
      },
    );
  }

  private async validateToken(rawToken: string): Promise<EmailLinkToken> {
    if (!rawToken?.trim()) {
      throw new BadRequestException('token이 필요합니다.');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken.trim())
      .digest('hex');

    const tokenRecord = await this.tokenRepository.findOne({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('유효하지 않거나 만료된 링크입니다.');
    }

    const now = new Date();
    if (tokenRecord.expiresAt.getTime() < now.getTime()) {
      throw new UnauthorizedException('링크가 만료되었습니다.');
    }

    if (tokenRecord.usedAt) {
      throw new UnauthorizedException('이미 사용된 링크입니다.');
    }

    return tokenRecord;
  }
}
