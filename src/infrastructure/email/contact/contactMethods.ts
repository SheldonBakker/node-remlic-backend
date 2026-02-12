import type { IContactForm } from './types';
import { HttpError } from '../../../shared/types/errors/appError';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import Logger from '../../../shared/utils/logger';
import { EmailService } from '../emailService';

export default class ContactService {
  private static readonly CONTEXT = 'CONTACT_SERVICE';

  public static async sendContactForm(data: IContactForm): Promise<{ message: string }> {
    const result = await EmailService.sendContactFormEvent({
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    if (!result.success) {
      Logger.error(this.CONTEXT, `Failed to send contact form event: ${result.error}`);
      throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to send message. Please try again later.');
    }

    return { message: 'Your message has been sent successfully.' };
  }
}
