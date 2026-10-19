/*
 * File: src/core/services/telegram.service.ts
 * Description: Outbound notification service sending formatted lead summaries to Telegram.
 * Exports: TelegramService
 */

import { Lead } from '../domain/lead.entity';

export class TelegramService {
  private readonly token: string | undefined;
  private readonly chatId: string | undefined;

  /*
   * Initializes credentials from environment variables.
   */
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
  }

  /*
   * Dispatches an HTML-formatted notification to the configured Telegram chat.
   * Parameter: lead (Lead) - The Lead entity to announce.
   * Returns: Promise resolving to void.
   */
  public async notifyLead(lead: Lead): Promise<void> {
    if (!this.token || !this.chatId) {
      return;
    }

    const message = [
      '<b>Новая заявка: Обжарка «Кварта»</b>',
      '',
      `<b>Имя:</b> ${lead.name}`,
      `<b>Телефон:</b> <code>${lead.phone}</code>`,
      `<b>Цель:</b> ${lead.topic}`,
      `<b>Комментарий:</b> ${lead.comment || '—'}`,
      `<b>Страница:</b> ${lead.utm.sourcePage || '—'}`,
      `<b>UTM:</b> ${lead.utm.utmSource || 'direct'} / ${lead.utm.utmCampaign || 'none'}`,
    ].join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    } catch (error) {
      console.error('Failed to dispatch Telegram lead notification:', error);
    }
  }
}