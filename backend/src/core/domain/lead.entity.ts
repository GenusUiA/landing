/**
 * @file src/core/domain/lead.entity.ts
 * @description Domain entity definitions, payload shapes, and metadata structures for coffee orders.
 * @exports LeadTopic, LeadUtmMeta, ClientContext, Lead, CreateLeadInput
 */

export type LeadTopic = 'подписка' | 'разовый заказ' | 'вопрос';

export interface LeadUtmMeta {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  sourcePage?: string | null;
}

export interface ClientContext {
  userAgent?: string | null;
  ip?: string | null;
}

export interface Lead {
  id?: number;
  name: string;
  phone: string;
  topic: LeadTopic;
  comment?: string | null;
  utm: LeadUtmMeta;
  client: ClientContext;
  createdAt?: string;
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  topic?: string;
  comment?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  sourcePage?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}