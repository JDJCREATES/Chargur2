/**
 * chatStorage.ts
 * 
 * Client-side chat storage and recovery system.
 * Handles conversation persistence, token recovery, and stream resumption.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatConversation {
  id: string;
  user_id: string;
  stage_id: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  metadata: any;
}

export interface ChatResponseToken {
  id: string;
  conversation_id: string;
  token_index: number;
  token_content: string;
  token_type: 'content' | 'suggestion' | 'autofill' | 'complete';
  created_at: string;
}

export interface ChatResponse {
  id: string;
  conversation_id: string;
  user_prompt: string;
  full_content: string;
  suggestions: string[];
  auto_fill_data: any;
  stage_complete: boolean;
  context: any;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export class ChatStorageManager {
  
  /**
   * Create a new conversation session
   */
  static async createConversation(
    stageId: string, 
    metadata: any
  ): Promise<ChatConversation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.user.id,
        stage_id: stageId,
        status: 'active',
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }

    return data;
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<ChatConversation | null> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }

    return data;
  }

  /**
   * Update conversation status
   */
  static async updateConversationStatus(
    conversationId: string, 
    status: 'active' | 'completed' | 'failed'
  ): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status })
      .eq('id', conversationId);

    if (error) {
      console.error('Failed to update conversation status:', error);
      throw new Error('Failed to update conversation status');
    }
  }

  /**
   * Save response tokens incrementally
   */
  static async saveResponseTokens(
    conversationId: string,
    tokens: Array<{
      index: number;
      content: string;
      type: 'content' | 'suggestion' | 'autofill' | 'complete';
    }>
  ): Promise<void> {
    console.log('🔄 ChatStorageManager.saveResponseTokens called:', {
      conversationId,
      tokenCount: tokens.length,
      tokenIndexes: tokens.map(t => t.index),
      tokenTypes: tokens.map(t => t.type)
    });
    
    const tokenData = tokens.map(token => ({
      conversation_id: conversationId,
      token_index: token.index,
      token_content: token.content,
      token_type: token.type
    }));

    console.log('📦 Prepared token data for upsert:', {
      conversationId,
      tokenCount: tokenData.length
    });
    
    const { error } = await supabase
      .from('chat_response_tokens')
      .upsert(tokenData, { 
        onConflict: 'conversation_id,token_index',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Failed to save response tokens:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        conversationId,
        tokenCount: tokens.length
      });
      throw new Error('Failed to save response tokens');
    } else {
      console.log('✅ Tokens saved successfully:', {
        conversationId,
        tokenCount: tokens.length
      });
    }
  }

  /**
   * Get saved tokens after a specific index
   */
  static async getTokensAfterIndex(
    conversationId: string,
    lastTokenIndex: number = -1
  ): Promise<ChatResponseToken[]> {
    const { data, error } = await supabase
      .from('chat_response_tokens')
      .select('*')
      .eq('conversation_id', conversationId)
      .gt('token_index', lastTokenIndex)
      .order('token_index', { ascending: true });

    if (error) {
      console.error('Failed to get tokens:', error);
      throw new Error('Failed to get tokens');
    }

    return data || [];
  }

  /**
   * Get the highest token index for a conversation
   */
  static async getLastTokenIndex(conversationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('chat_response_tokens')
      .select('token_index')
      .eq('conversation_id', conversationId)
      .order('token_index', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return -1; // No tokens saved yet
    }

    return data.token_index;
  }

  /**
   * Save complete response
   */
  static async saveCompleteResponse(
    conversationId: string,
    response: {
      full_content: string;
      suggestions: string[];
      auto_fill_data: any;
      stage_complete: boolean;
      context: any;
    }
  ): Promise<ChatResponse> {
    console.log('🔄 ChatStorageManager.saveCompleteResponse called:', {
      conversationId,
      contentLength: response.full_content?.length || 0,
      suggestionsCount: response.suggestions?.length || 0,
      hasAutoFillData: !!(response.auto_fill_data && Object.keys(response.auto_fill_data).length > 0),
      stageComplete: response.stage_complete
    });
    
    const { data, error } = await supabase
      .from('chat_responses')
      .upsert({
        conversation_id: conversationId,
        full_content: response.full_content,
        suggestions: response.suggestions,
        auto_fill_data: response.auto_fill_data,
        stage_complete: response.stage_complete,
        context: response.context,
        is_complete: true
      }, {
        onConflict: 'conversation_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to save complete response:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        conversationId
      });
      throw new Error('Failed to save complete response');
    } else {
      console.log('✅ Complete response saved successfully:', {
        conversationId,
        responseId: data.id
      });
    }

    return data;
  }

  /**
   * Get complete response for a conversation
   */
  static async getCompleteResponse(conversationId: string): Promise<ChatResponse | null> {
    const { data, error } = await supabase
      .from('chat_responses')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error) {
      console.error('Failed to get complete response:', error);
      return null;
    }

    return data;
  }

  /**
   * Reconstruct content from saved tokens
   */
  static async reconstructContentFromTokens(conversationId: string): Promise<string> {
    console.log('🔄 ChatStorageManager.reconstructContentFromTokens called:', {
      conversationId
    });
    
    const tokens = await this.getTokensAfterIndex(conversationId, -1);
    console.log('📋 Retrieved tokens for reconstruction:', {
      conversationId,
      tokenCount: tokens.length
    });
    
    // Filter and sort content tokens
    const contentTokens = tokens
      .filter(token => token.token_type === 'content')
      .sort((a, b) => a.token_index - b.token_index);
    
    console.log('📋 Content tokens for reconstruction:', {
      conversationId,
      contentTokenCount: contentTokens.length
    });

    // Return the latest content (assuming incremental updates)
    const result = contentTokens.length > 0 
      ? contentTokens[contentTokens.length - 1].token_content
      : '';
      
    console.log('📋 Reconstruction result:', {
      conversationId,
      hasContent: !!result,
      contentLength: result.length
    });
    
    return result;
  }

  /**
   * Check if conversation is complete
   */
  static async isConversationComplete(conversationId: string): Promise<boolean> {
    const response = await this.getCompleteResponse(conversationId);
    return response?.is_complete || false;
  }

  /**
   * Clean up old conversations (optional maintenance)
   */
  static async cleanupOldConversations(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'failed']);

    if (error) {
      console.error('Failed to cleanup old conversations:', error);
    }
  }
}