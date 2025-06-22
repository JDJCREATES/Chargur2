/**
 * chatRecovery.ts
 * 
 * Client-side chat recovery utilities.
 * Handles reconnection and resumption of interrupted conversations.
 */

import { ChatStorageManager } from './chatStorage';

export interface RecoveryResult {
  success: boolean;
  content?: string;
  suggestions?: string[];
  autoFillData?: any;
  stageComplete?: boolean;
  isComplete?: boolean;
  error?: string;
}

export class ChatRecoveryManager {
  
  /**
   * Attempt to recover a conversation from the server
   */
  static async recoverConversation(
    conversationId: string
  ): Promise<RecoveryResult> {
    try {
      console.log('🔄 Attempting to recover conversation:', conversationId);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/retrieve-agent-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          conversationId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Recovery response received:', {
        tokensCount: data.tokens?.length || 0,
        hasCompleteResponse: !!data.completeResponse,
        conversationStatus: data.conversationStatus
      });
      
      // If we have a complete response, return it
      if (data.completeResponse && data.completeResponse.is_complete) {
        return {
          success: true,
          content: data.completeResponse.full_content,
          suggestions: data.completeResponse.suggestions || [],
          autoFillData: data.completeResponse.auto_fill_data || {},
          stageComplete: data.completeResponse.stage_complete || false,
          isComplete: true
        };
      }
      
      // If we have tokens, reconstruct the content
      if (data.tokens && data.tokens.length > 0) {
        const contentTokens = data.tokens
          .filter((token: any) => token.token_type === 'content')
          .sort((a: any, b: any) => a.token_index - b.token_index);
        
        const latestContent = contentTokens.length > 0 
          ? contentTokens[contentTokens.length - 1].token_content 
          : '';
        
        return {
          success: true,
          content: latestContent,
          isComplete: false
        };
      }
      
      // No content to recover
      return {
        success: true,
        content: '',
        isComplete: false
      };
      
    } catch (error) {
      console.error('❌ Failed to recover conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Check if a conversation needs recovery
   */
  static async needsRecovery(conversationId: string): Promise<boolean> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return false;
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/chat_conversations?id=eq.${conversationId}&select=status`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        }
      });
      
      if (!response.ok) return false;
      
      const [conversation] = await response.json();
      if (!conversation) return false;
      
      // Check if conversation is active (not completed or failed)
      return conversation.status === 'active';
      
    } catch (error) {
      console.error('Failed to check recovery status:', error);
      return false;
    }
  }
  
  /**
   * Resume streaming from a specific token index
   */
  static async resumeStreaming(
    conversationId: string,
    lastTokenIndex: number,
    agentContext: any
  ): Promise<Response> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    console.log('🔄 Resuming streaming from token index:', lastTokenIndex);
    
    return fetch(`${supabaseUrl}/functions/v1/agent-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        ...agentContext,
        conversationId,
        lastTokenIndex,
        resumeStreaming: true
      }),
      // Add a longer timeout for the fetch request
      signal: AbortSignal.timeout(2 * 60 * 1000), // 2 minute timeout
    });
  }
  
  /**
   * Clean up failed or abandoned conversations
   */
  static async cleanupFailedConversations(): Promise<void> {
    try {
      console.log('🧹 Cleanup would be handled by server-side cron job');
      // This would typically be handled by a server-side cron job or edge function
    } catch (error) {
      console.error('Failed to cleanup conversations:', error);
    }
  }
  
  /**
   * Get recovery status for debugging
   */
  static async getRecoveryStatus(conversationId: string): Promise<{
    conversationExists: boolean;
    conversationStatus?: string;
    tokenCount: number;
    isComplete: boolean;
  }> {
    try {
      const recovery = await this.recoverConversation(conversationId);
      
      console.log('📊 Recovery status:', {
        conversationId,
        success: recovery.success,
        hasContent: !!recovery.content,
        isComplete: recovery.isComplete
      });
      
      return {
        conversationExists: recovery.success,
        conversationStatus: recovery.success ? 'active' : 'unknown',
        tokenCount: recovery.content ? 1 : 0,
        isComplete: recovery.isComplete || false
      };
    } catch (error) {
      console.error('Failed to get recovery status:', error);
      return {
        conversationExists: false,
        tokenCount: 0,
        isComplete: false
      };
    }
  }
}