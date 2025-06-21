/**
 * llmClient.ts
 * 
 * LLM client abstraction layer that handles communication with various
 * AI providers (OpenAI, Anthropic, etc.) with proper error handling,
 * retry logic, and response streaming.
 */

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
  usage?: LLMResponse['usage'];
}

export class LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private provider: 'openai' | 'anthropic';

  constructor(config: {
    provider: 'openai' | 'anthropic';
    apiKey: string;
    model?: string;
  }) {
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.model = config.model || this.getDefaultModel();
    this.baseUrl = this.getBaseUrl();
  }

  private getDefaultModel(): string {
    switch (this.provider) {
      case 'openai':
        return 'gpt-4-turbo-preview';
      case 'anthropic':
        return 'claude-3-sonnet-20240229';
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private getBaseUrl(): string {
    switch (this.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(request);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  async *generateStreamingResponse(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    const streamRequest = { ...request, stream: true };
    
    try {
      const response = await this.makeStreamingRequest(streamRequest);
      
      if (!response.body) {
        throw new Error('No response body for streaming request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const chunk = this.parseStreamChunk(line);
              if (chunk) {
                yield chunk;
              }
            } catch (parseError) {
              console.warn('Failed to parse stream chunk:', parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw new Error(`Streaming request failed: ${error}`);
    }
  }

  private async makeRequest(request: LLMRequest): Promise<LLMResponse> {
    const requestBody = this.formatRequest(request);
    
    const response = await fetch(`${this.baseUrl}${this.getEndpoint()}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`LLM API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return this.formatResponse(data);
  }

  private async makeStreamingRequest(request: LLMRequest): Promise<Response> {
    const requestBody = this.formatRequest(request);
    
    const response = await fetch(`${this.baseUrl}${this.getEndpoint()}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`LLM API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response;
  }

  private getEndpoint(): string {
    switch (this.provider) {
      case 'openai':
        return '/chat/completions';
      case 'anthropic':
        return '/messages';
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const baseHeaders = {
      'Content-Type': 'application/json',
    };

    switch (this.provider) {
      case 'openai':
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${this.apiKey}`,
        };
      case 'anthropic':
        return {
          ...baseHeaders,
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        };
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private formatRequest(request: LLMRequest): any {
    switch (this.provider) {
      case 'openai':
        return {
          model: this.model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          stream: request.stream || false,
        };
      
      case 'anthropic':
        return {
          model: this.model,
          system: request.systemPrompt,
          messages: [
            { role: 'user', content: request.userPrompt }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          stream: request.stream || false,
        };
      
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private formatResponse(data: any): LLMResponse {
    switch (this.provider) {
      case 'openai':
        return {
          content: data.choices[0]?.message?.content || '',
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
          model: data.model,
          finishReason: data.choices[0]?.finish_reason,
        };
      
      case 'anthropic':
        return {
          content: data.content[0]?.text || '',
          usage: data.usage ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          } : undefined,
          model: data.model,
          finishReason: data.stop_reason,
        };
      
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private parseStreamChunk(line: string): LLMStreamChunk | null {
    if (!line.startsWith('data: ')) {
      return null;
    }

    const data = line.slice(6);
    
    if (data === '[DONE]') {
      return { content: '', done: true };
    }

    try {
      const parsed = JSON.parse(data);
      
      switch (this.provider) {
        case 'openai':
          const content = parsed.choices[0]?.delta?.content || '';
          const done = parsed.choices[0]?.finish_reason !== null;
          return { content, done };
        
        case 'anthropic':
          if (parsed.type === 'content_block_delta') {
            return { content: parsed.delta?.text || '', done: false };
          } else if (parsed.type === 'message_stop') {
            return { content: '', done: true };
          }
          return null;
        
        default:
          return null;
      }
    } catch (error) {
      console.warn('Failed to parse stream chunk:', error);
      return null;
    }
  }

  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication errors, invalid requests, etc.
    const status = error.status || error.response?.status;
    return status === 401 || status === 403 || status === 400;
  }
}

// Factory function for creating LLM clients
export function createLLMClient(config: {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}): LLMClient {
  return new LLMClient(config);
}