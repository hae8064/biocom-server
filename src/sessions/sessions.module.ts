import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { AdminSessionsController } from './admin-sessions.controller';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Booking])],
  controllers: [AdminSessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
