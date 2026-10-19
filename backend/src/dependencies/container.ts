/*
 * File: src/dependencies/container.ts
 * Description: Composition root assembling singleton instances of repositories and application services.
 * Exports: container
 */

import { SqliteLeadRepository } from '../core/infrastructure/sqlite-lead.repository';
import { TelegramService } from '../core/services/telegram.service';
import { LeadService } from '../core/services/lead.service';

const leadRepository = new SqliteLeadRepository();
const telegramService = new TelegramService();
const leadService = new LeadService(leadRepository, telegramService);

export const container = {
  /*
   * Retrieves the singleton instance of LeadService.
   * Returns: Configured LeadService instance.
   */
  getLeadService: (): LeadService => leadService,
};