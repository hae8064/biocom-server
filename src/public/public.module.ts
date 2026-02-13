import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from '../applicants/entities/applicant.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { EmailLinkToken } from '../email-link-tokens/entities/email-link-token.entity';
import { ScheduleSlotsModule } from '../schedule-slots/schedule-slots.module';
import { ScheduleSlot } from '../schedule-slots/entities/schedule-slot.entity';
import { User } from '../users/entities/user.entity';
import { PublicBookingsController } from './bookings/public-bookings.controller';
import { PublicBookingsService } from './bookings/public-bookings.service';
import { PublicReserveController } from './reserve/public-reserve.controller';
import { PublicReserveService } from './reserve/public-reserve.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailLinkToken,
      User,
      ScheduleSlot,
      Applicant,
      Booking,
    ]),
    ScheduleSlotsModule,
  ],
  controllers: [PublicReserveController, PublicBookingsController],
  providers: [PublicReserveService, PublicBookingsService],
})
export class PublicModule {}
