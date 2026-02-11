import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const portRaw = this.configService.get<string>('SMTP_PORT');
    const port = portRaw ? parseInt(portRaw, 10) : 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: (port || 587) === 465,
      auth: { user, pass },
    });
  }

  /** SMTP 설정 여부 */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /** 예약 링크 이메일 발송 */
  async sendReservationLink(toEmail: string, link: string): Promise<void> {
    if (!this.transporter) {
      throw new InternalServerErrorException(
        'SMTP가 설정되지 않았습니다. .env에 SMTP_HOST, SMTP_USER, SMTP_PASS를 설정하세요. (Gmail: smtp.gmail.com, 587, 앱 비밀번호 사용)',
      );
    }

    const from =
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('SMTP_USER');

    try {
      await this.transporter.sendMail({
        from: `"상담 예약" <${from}>`,
        to: toEmail,
        subject: '[상담 예약] 예약 링크가 발송되었습니다',
        text: `아래 링크를 클릭하여 상담 예약을 진행해 주세요.\n\n${link}`,
        html: `
        <p>아래 링크를 클릭하여 상담 예약을 진행해 주세요.</p>
        <p><a href="${link}" style="color: #2563eb; text-decoration: underline;">예약 페이지로 이동</a></p>
        <p>또는 아래 주소를 브라우저에 복사하여 접속하세요:</p>
        <p style="word-break: break-all; font-size: 12px; color: #666;">${link}</p>
      `,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '메일 발송에 실패했습니다.';
      throw new InternalServerErrorException(
        `이메일 발송 실패: ${message}. SMTP 설정 및 Gmail 앱 비밀번호를 확인하세요.`,
      );
    }
  }
}
