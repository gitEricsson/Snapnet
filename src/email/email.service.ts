import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '../utils/common/config/config.service';

@Injectable()
export class EmailService {
  private static instance: EmailService;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
    if (EmailService.instance) {
      return EmailService.instance;
    }
    EmailService.instance = this;
  }

  /**
   * Helper method to add common context variables to all emails
   */
  private getCommonContext(): Record<string, any> {
    return {
      appName: this.configService.appName,
      year: new Date().getFullYear().toString(),
    };
  }

  
  async sendWelcomeEmail(
    email: string,
    name: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Welcome to ${this.configService.appName}!`,
      template: 'welcome',
      context: {
        name,
        ...this.getCommonContext(),
      },
    });
  }
}
