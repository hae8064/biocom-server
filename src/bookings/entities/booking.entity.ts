import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Applicant } from '../../applicants/entities/applicant.entity';
import { ScheduleSlot } from '../../schedule-slots/entities/schedule-slot.entity';

@Entity('bookings')
@Index(['slot', 'createdAt', 'applicant'])
@Unique(['slot', 'applicant'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScheduleSlot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slot_id' })
  slot: ScheduleSlot;

  @ManyToOne(() => Applicant, (applicant) => applicant.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Applicant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
