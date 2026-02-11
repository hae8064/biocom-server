import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'counselor@example.com', description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (8자 이상)' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.COUNSELOR,
    description: '역할 (생략 시 COUNSELOR)',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'role은 COUNSELOR 또는 ADMIN이어야 합니다.' })
  role?: UserRole;
}
