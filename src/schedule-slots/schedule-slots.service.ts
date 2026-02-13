import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { UserRole } from '../users/entities/user.entity';
import { SlotStatus } from './entities/schedule-slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import {
  SlotBookingItemDto,
  SlotBookingsResponseDto,
} from './dto/slot-booking-response.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { ScheduleSlot } from './entities/schedule-slot.entity';
import { formatDateToKst } from '../common/utils/date.utils';
import { computeEndAt, parseKstToDate, validate30MinSlot } from './slot.utils';
import type { JwtValidateResult } from '../auth/strategies/jwt.strategy';

@Injectable()
export class ScheduleSlotsService {
  constructor(
    @InjectRepository(ScheduleSlot)
    private readonly slotRepository: Repository<ScheduleSlot>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(
    dto: CreateSlotDto,
    user: JwtValidateResult,
  ): Promise<ScheduleSlot> {
    const startAt = parseKstToDate(dto.startAt);
    const endAt = computeEndAt(startAt);
    try {
      validate30MinSlot(startAt, endAt);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : '슬롯 검증 실패',
      );
    }

    const existing = await this.slotRepository.findOne({
      where: { counselorId: user.userId, startAt },
    });
    if (existing) {
      throw new ConflictException(
        '해당 상담사의 동일한 시작 시각 슬롯이 이미 존재합니다.',
      );
    }

    const slot = this.slotRepository.create({
      counselorId: user.userId,
      startAt,
      endAt,
      capacity: 3,
      status: dto.status ?? SlotStatus.OPEN,
    });
    return this.slotRepository.save(slot);
  }

  /** 슬롯 엔티티를 KST 날짜 형식으로 응답용 객체로 변환 */
  formatSlotForResponse(slot: ScheduleSlot): Record<string, unknown> {
    const startAt =
      slot.startAt instanceof Date ? slot.startAt : new Date(slot.startAt);
    const endAt =
      slot.endAt instanceof Date ? slot.endAt : new Date(slot.endAt);
    return {
      id: slot.id,
      counselorId: slot.counselorId,
      startAt: formatDateToKst(startAt),
      endAt: formatDateToKst(endAt),
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      status: slot.status,
    };
  }

  async findAll(
    counselorId: string,
    includeBookings = false,
  ): Promise<
    (Record<string, unknown> & { bookings?: SlotBookingItemDto[] })[]
  > {
    const slots = await this.slotRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.counselor', 'counselor')
      .where('slot.counselor_id = :counselorId', { counselorId })
      .orderBy('slot.startAt', 'ASC')
      .getMany();

    if (!includeBookings || slots.length === 0) {
      return slots.map((s) => this.formatSlotForResponse(s));
    }

    const slotIds = slots.map((s) => s.id);
    const bookings = await this.bookingRepository.find({
      where: { slot: { id: In(slotIds) } },
      relations: ['applicant', 'slot'],
      order: { createdAt: 'ASC' },
    });

    const bookingsBySlotId = new Map<string, SlotBookingItemDto[]>();
    for (const b of bookings) {
      const slotId = b.slot?.id ?? (b as { slotId?: string }).slotId;
      if (!slotId) continue;
      const list = bookingsBySlotId.get(slotId) ?? [];
      list.push({
        id: b.id,
        applicant: {
          id: b.applicant.id,
          email: b.applicant.email,
          name: b.applicant.name,
          phone: b.applicant.phone,
        },
        createdAt: formatDateToKst(b.createdAt),
      });
      bookingsBySlotId.set(slotId, list);
    }

    return slots.map((slot) => ({
      ...this.formatSlotForResponse(slot),
      bookings: bookingsBySlotId.get(slot.id) ?? [],
    }));
  }

  /**
   * 공개 예약용: 상담사의 예약 가능 슬롯 조회.
   * date 지정 시: 해당 날짜(KST) 전체 슬롯 (지난 시간 포함).
   * date 미지정 시: startAt >= now, status = OPEN.
   */
  async findAvailableForPublic(
    counselorId: string,
    date?: string,
  ): Promise<ScheduleSlot[]> {
    const qb = this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.counselor_id = :counselorId', { counselorId })
      .andWhere('slot.status = :status', { status: SlotStatus.OPEN })
      .orderBy('slot.startAt', 'ASC');

    if (date?.trim()) {
      let startOfDay: Date;
      try {
        startOfDay = parseKstToDate(`${date.trim()}T00:00:00`);
      } catch {
        throw new BadRequestException(
          'date는 YYYY-MM-DD 형식이어야 합니다. (예: 2026-02-11)',
        );
      }
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      qb.andWhere('slot.start_at >= :startOfDay', { startOfDay }).andWhere(
        'slot.start_at < :endOfDay',
        { endOfDay },
      );
    } else {
      const now = new Date();
      qb.andWhere('slot.start_at >= :now', { now });
    }

    return qb.getMany();
  }

  async findBookingsBySlotId(
    slotId: string,
    user: JwtValidateResult,
  ): Promise<SlotBookingsResponseDto> {
    const slot = await this.findOne(slotId);

    if (user.role === UserRole.COUNSELOR && slot.counselorId !== user.userId) {
      throw new ForbiddenException('본인의 슬롯만 조회할 수 있습니다.');
    }

    const bookings = await this.bookingRepository.find({
      where: { slot: { id: slotId } },
      relations: ['applicant'],
      order: { createdAt: 'ASC' },
    });

    return bookings.map(
      (b): SlotBookingItemDto => ({
        id: b.id,
        applicant: {
          id: b.applicant.id,
          email: b.applicant.email,
          name: b.applicant.name,
          phone: b.applicant.phone,
        },
        createdAt: formatDateToKst(b.createdAt),
      }),
    );
  }

  async findOne(id: string): Promise<ScheduleSlot> {
    const slot = await this.slotRepository.findOne({
      where: { id },
      relations: ['counselor'],
    });
    if (!slot) {
      throw new NotFoundException('슬롯을 찾을 수 없습니다.');
    }
    return slot;
  }

  async update(
    id: string,
    dto: UpdateSlotDto,
    user: JwtValidateResult,
  ): Promise<ScheduleSlot> {
    const slot = await this.findOne(id);

    if (user.role === UserRole.COUNSELOR && slot.counselorId !== user.userId) {
      throw new ForbiddenException('본인의 슬롯만 수정할 수 있습니다.');
    }

    const updates: Partial<ScheduleSlot> = {};
    if (dto.startAt != null) {
      const startAt = parseKstToDate(dto.startAt);
      const endAt = computeEndAt(startAt);
      try {
        validate30MinSlot(startAt, endAt);
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : '슬롯 검증 실패',
        );
      }
      const conflicting = await this.slotRepository.findOne({
        where: { counselorId: slot.counselorId, startAt },
      });
      if (conflicting && conflicting.id !== slot.id) {
        throw new ConflictException(
          '해당 상담사의 동일한 시작 시각 슬롯이 이미 존재합니다.',
        );
      }
      updates.startAt = startAt;
      updates.endAt = endAt;
    }
    if (dto.status != null) updates.status = dto.status;

    await this.slotRepository.update(id, updates);
    return this.findOne(id);
  }

  async remove(id: string, user: JwtValidateResult): Promise<void> {
    const slot = await this.findOne(id);

    if (user.role === UserRole.COUNSELOR && slot.counselorId !== user.userId) {
      throw new ForbiddenException('본인의 슬롯만 삭제할 수 있습니다.');
    }

    await this.slotRepository.delete(id);
  }
}
