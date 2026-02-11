import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLinkToken } from './entities/email-link-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLinkToken])],
  exports: [TypeOrmModule],
})
export class EmailLinkTokensModule {}
