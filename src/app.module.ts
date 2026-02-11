import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { BookingsModule } from './bookings/bookings.module';
import { EmailLinkTokensModule } from './email-link-tokens/email-link-token.module';
import { ScheduleSlotsModule } from './schedule-slots/schedule-slots.module';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('database'),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ScheduleSlotsModule,
    ApplicantsModule,
    BookingsModule,
    SessionsModule,
    EmailLinkTokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
