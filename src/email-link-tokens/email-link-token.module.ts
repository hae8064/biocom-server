import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { EmailLinkToken } from './entities/email-link-token.entity';
import { AdminEmailLinksController } from './admin-email-links.controller';
import { EmailLinkTokensService } from './email-link-tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailLinkToken]),
    AuthModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AdminEmailLinksController],
  providers: [EmailLinkTokensService],
  exports: [TypeOrmModule, EmailLinkTokensService],
})
export class EmailLinkTokensModule {}
