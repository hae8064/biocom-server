import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Booking } from '../bookings/entities/booking.entity';
import { AdminSlotsController } from './admin-slots.controller';
import { ScheduleSlot } from './entities/schedule-slot.entity';
import { ScheduleSlotsService } from './schedule-slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleSlot, Booking]), AuthModule],
  controllers: [AdminSlotsController],
  providers: [ScheduleSlotsService],
  exports: [TypeOrmModule, ScheduleSlotsService],
})
export class ScheduleSlotsModule {}
