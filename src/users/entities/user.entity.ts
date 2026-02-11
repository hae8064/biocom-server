import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ScheduleSlot } from '../../schedule-slots/entities/schedule-slot.entity';

export enum UserRole {
  COUNSELOR = 'COUNSELOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COUNSELOR,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ScheduleSlot, (slot) => slot.counselor)
  scheduleSlots: ScheduleSlot[];
}
