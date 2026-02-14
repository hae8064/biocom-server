import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { UserRole } from '../users/entities/user.entity';
import { formatDateToKst } from '../common/utils/date.utils';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/session.entity';
import type { JwtValidateResult } from '../auth/strategies/jwt.strategy';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  /**
   * 예약에 대한 상담 기록 저장. booking_id당 1건만 존재 (upsert).
   */
  async saveSessionByBookingId(
    bookingId: string,
    dto: CreateSessionDto,
    user: JwtValidateResult,
  ): Promise<{ message: string; session: Record<string, unknown> }> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['slot'],
    });
    if (!booking) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    if (
      user.role === UserRole.COUNSELOR &&
      booking.slot.counselorId !== user.userId
    ) {
      throw new ForbiddenException(
        '본인 슬롯의 예약에만 상담 기록을 저장할 수 있습니다.',
      );
    }

    let session = await this.sessionRepository.findOne({
      where: { booking: { id: bookingId } },
      relations: ['booking'],
    });

    const now = new Date();
    const updates: Partial<Session> = {};
    if (dto.notes !== undefined) updates.notes = dto.notes ?? null;
    if (dto.outcome !== undefined) {
      updates.outcome = dto.outcome ?? null;
      if (dto.outcome != null) updates.endedAt = now; // outcome 설정 시 상담 종료 시각 자동 기록
    }

    if (session) {
      Object.assign(session, updates);
      session = await this.sessionRepository.save(session);
    } else {
      session = this.sessionRepository.create({
        booking: { id: bookingId },
        startedAt: now, // 최초 생성 시 상담 시작 시각 자동 기록
        ...updates,
      });
      session = await this.sessionRepository.save(session);
    }

    return {
      message: '상담 기록이 저장되었습니다.',
      session: this.formatSessionForResponse(session, bookingId),
    };
  }

  /**
   * 예약에 대한 상담 기록 조회.
   */
  async getSessionByBookingId(
    bookingId: string,
    user: JwtValidateResult,
  ): Promise<Record<string, unknown>> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['slot'],
    });
    if (!booking) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    if (
      user.role === UserRole.COUNSELOR &&
      booking.slot.counselorId !== user.userId
    ) {
      throw new ForbiddenException(
        '본인 슬롯의 예약만 상담 기록을 조회할 수 있습니다.',
      );
    }

    const session = await this.sessionRepository.findOne({
      where: { booking: { id: bookingId } },
    });
    if (!session) {
      throw new NotFoundException('해당 예약에 대한 상담 기록이 없습니다.');
    }

    return this.formatSessionForResponse(session, bookingId);
  }

  formatSessionForResponse(
    session: Session,
    bookingId: string,
  ): Record<string, unknown> {
    return {
      id: session.id,
      bookingId,
      notes: session.notes,
      outcome: session.outcome,
      startedAt: session.startedAt ? formatDateToKst(session.startedAt) : null,
      endedAt: session.endedAt ? formatDateToKst(session.endedAt) : null,
    };
  }
}
