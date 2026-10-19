/*
 * File: src/app/api/lead/route.ts
 * Description: Next.js App Router HTTP Route Handler for POST /api/lead.
 * Exports: POST handler function
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../dependencies/container';
import { DuplicateSubmissionError, ValidationError } from '../../../core/domain/errors';

/*
 * Handles incoming POST requests to submit a new lead.
 * Parameter: request (NextRequest) - Next.js Request object.
 * Returns: JSON response indicating creation status or error reason.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const userAgent = request.headers.get('user-agent');
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip');

    const leadService = container.getLeadService();

    const createdLead = await leadService.createLead({
      name: body.name,
      phone: body.phone,
      topic: body.topic,
      comment: body.comment,
      utmSource: body.utm_source,
      utmMedium: body.utm_medium,
      utmCampaign: body.utm_campaign,
      utmContent: body.utm_content,
      utmTerm: body.utm_term,
      sourcePage: body.source_page,
      userAgent,
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        id: createdLead.id,
        message: 'Спасибо! Ваша заявка принята, мы свяжемся с вами в ближайшее время.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (error instanceof DuplicateSubmissionError) {
      return NextResponse.json({ error: error.message, isDuplicate: true }, { status: 429 });
    }

    console.error('Unhandled API exception in POST /api/lead:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить заявку. Пожалуйста, попробуйте позже.' },
      { status: 500 }
    );
  }
}