// ============================================
// AI POLISH SERVICE
// Polishes user-written text (idea descriptions, kudos messages)
// using Claude API (Anthropic).
//
// STATUS: DISABLED — set ANTHROPIC_API_KEY env var to enable.
// When enabled, requires no code changes — just add the key to Railway.
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PolishMode = 'idea' | 'kudos';

export interface PolishResult {
  enabled: boolean;
  original: string;
  polished: string | null;
  message?: string;
}

@Injectable()
export class AiPolishService {
  private readonly logger = new Logger(AiPolishService.name);
  private readonly apiKey: string | undefined;
  private readonly model = 'claude-haiku-4-5-20251001'; // fast + cheap

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('AI Polish disabled — ANTHROPIC_API_KEY not set.');
    } else {
      this.logger.log('AI Polish enabled.');
    }
  }

  get isEnabled(): boolean {
    return !!this.apiKey;
  }

  async polish(text: string, mode: PolishMode = 'idea'): Promise<PolishResult> {
    if (!this.isEnabled) {
      return { enabled: false, original: text, polished: null, message: 'AI Polish not configured' };
    }

    const systemPrompts: Record<PolishMode, string> = {
      idea: `You are a professional business writing assistant.
Improve the following Kaizen idea description: make it clear, concise, and professional.
Keep the original meaning. Output only the improved text, no explanations.
Target: 1–3 sentences maximum. Language: match the input language (Vietnamese or English).`,

      kudos: `You are a warm, professional recognition writer.
Improve the following kudos message: make it sincere, specific, and uplifting.
Keep the original intent. Output only the improved text, no explanations.
Target: 1–2 sentences. Language: match the input language (Vietnamese or English).`,
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 256,
          system: systemPrompts[mode],
          messages: [{ role: 'user', content: text }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Anthropic API error: ${err}`);
        return { enabled: true, original: text, polished: null, message: 'API error, using original' };
      }

      const json = await response.json() as { content: { text: string }[] };
      const polished = json.content?.[0]?.text?.trim() ?? null;

      return { enabled: true, original: text, polished };
    } catch (err) {
      this.logger.error('AI Polish fetch failed', (err as Error).message);
      return { enabled: true, original: text, polished: null, message: 'Network error' };
    }
  }
}
