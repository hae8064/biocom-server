import {
  Column,
  Entity,
  // Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SlotStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('schedule_slots')
// @Index(['counselorId', 'startAt'])
@Unique(['counselorId', 'startAt'])
export class ScheduleSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'counselor_id', type: 'uuid' })
  counselorId: string;

  @ManyToOne(() => User, (user) => user.scheduleSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'counselor_id' })
  counselor: User;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'int', default: 3 })
  capacity: number;

  @Column({ name: 'booked_count', type: 'int', default: 0 })
  bookedCount: number;

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.OPEN,
  })
  status: SlotStatus;
}
