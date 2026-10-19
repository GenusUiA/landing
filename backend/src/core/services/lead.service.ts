/*
 * File: src/core/services/lead.service.ts
 * Description: Core domain use case service handling phone sanitization, deduplication checks, and persistence orchestration.
 * Exports: LeadService
 */

import { ILeadRepository } from '../domain/lead.repository.interface';
import { CreateLeadInput, Lead, LeadTopic } from '../domain/lead.entity';
import { DuplicateSubmissionError, ValidationError } from '../domain/errors';
import { TelegramService } from './telegram.service';

export class LeadService {
  private static readonly BY_PHONE_REGEX = /^(?:\+?375)(?:24|25|29|33|44)\d{7}$/;
  private static readonly RATE_LIMIT_MINUTES = 10;
  private static readonly ALLOWED_TOPICS: LeadTopic[] = ['подписка', 'разовый заказ', 'вопрос'];

  /*
   * Initializes dependencies for lead registration workflow.
   * Parameter: leadRepository (ILeadRepository) - Persistence port implementation.
   * Parameter: telegramService (TelegramService) - Notification service instance.
   */
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly telegramService: TelegramService
  ) {}

  /*
   * Normalizes raw phone inputs to standard E.164 Belarusian format.
   * Parameter: rawPhone (string) - Raw phone string.
   * Returns: Normalized phone string starting with +375.
   */
  private normalizePhone(rawPhone: string): string {
    let sanitized = rawPhone.replace(/[^\d+]/g, '');
    if (sanitized.startsWith('80')) {
      sanitized = '+375' + sanitized.slice(2);
    }
    if (sanitized.startsWith('375') && !sanitized.startsWith('+')) {
      sanitized = '+' + sanitized;
    }
    return sanitized;
  }

  /*
   * Validates and creates a new lead.
   * Parameter: input (CreateLeadInput) - Client form data and request context.
   * Returns: Newly created Lead entity.
   * Throws: ValidationError when payload contains invalid fields or phone numbers.
   * Throws: DuplicateSubmissionError when phone cooldown period is violated.
   */
  public async createLead(input: CreateLeadInput): Promise<Lead> {
    const trimmedName = input.name?.trim();
    if (!trimmedName) {
      throw new ValidationError('Пожалуйста, укажите ваше имя.');
    }

    if (!input.phone) {
      throw new ValidationError('Пожалуйста, укажите номер телефона.');
    }

    const normalizedPhone = this.normalizePhone(input.phone);
    if (!LeadService.BY_PHONE_REGEX.test(normalizedPhone)) {
      throw new ValidationError('Неверный номер. Укажите белорусский номер (+375 25/29/33/44).');
    }

    const isDuplicate = await this.leadRepository.existsRecentByPhone(
      normalizedPhone,
      LeadService.RATE_LIMIT_MINUTES
    );

    if (isDuplicate) {
      throw new DuplicateSubmissionError(
        'Заявка с этого номера уже получена. Менеджер свяжется с вами в течение рабочего дня.'
      );
    }

    const rawTopic = input.topic?.toLowerCase().trim() as LeadTopic;
    const resolvedTopic: LeadTopic = LeadService.ALLOWED_TOPICS.includes(rawTopic)
      ? rawTopic
      : 'разовый заказ';

    const lead: Lead = {
      name: trimmedName,
      phone: normalizedPhone,
      topic: resolvedTopic,
      comment: input.comment?.trim() || null,
      utm: {
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        utmContent: input.utmContent ?? null,
        utmTerm: input.utmTerm ?? null,
        sourcePage: input.sourcePage ?? null,
      },
      client: {
        userAgent: input.userAgent ?? null,
        ip: input.ip ?? null,
      },
    };

    const leadId = await this.leadRepository.create(lead);
    lead.id = leadId;

    await this.telegramService.notifyLead(lead);

    return lead;
  }
}