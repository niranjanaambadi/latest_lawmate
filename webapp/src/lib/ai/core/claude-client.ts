// src/lib/ai/core/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeClient {
  private client: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async analyze(prompt: string, context: string, maxTokens = 4096) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system: `You are an expert legal AI assistant specializing in Kerala High Court criminal writ petitions (WP Cr). 
You have deep knowledge of:
- Kerala High Court precedents and practice
- Criminal Procedure Code (Cr.P.C.)
- Constitutional law (Articles 14, 19, 20, 21, 226)
- Writ jurisdiction principles
Provide precise, actionable legal analysis.`,
      messages: [
        {
          role: 'user',
          content: `${context}\n\n${prompt}`
        }
      ]
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  }

  async analyzeWithCache(
    prompt: string, 
    cacheableContext: string,
    dynamicContext: string,
    maxTokens = 4096
  ) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system: [
        {
          type: "text",
          text: `You are an expert legal AI assistant specializing in Kerala High Court criminal writ petitions.`,
        },
        {
          type: "text", 
          text: cacheableContext,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [
        {
          role: 'user',
          content: `${dynamicContext}\n\n${prompt}`
        }
      ]
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  }
}