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
   * Attempt to recover a conversation from the server using ChatStorageManager
   */
  static async recoverConversation(
    conversationId: string
  ): Promise<RecoveryResult> {
    try {
      console.log('🔄 Attempting to recover conversation:', conversationId);
      
      // Check for complete response first
      const completeResponse = await ChatStorageManager.getCompleteResponse(conversationId);
      if (completeResponse && completeResponse.is_complete) {
        return {
          success: true,
          content: completeResponse.full_content,
          suggestions: completeResponse.suggestions || [],
          autoFillData: completeResponse.auto_fill_data || {},
          stageComplete: completeResponse.stage_complete || false,
          isComplete: true
        };
      }
      
      // Check for partial content in conversation
      const conversation = await ChatStorageManager.getConversation(conversationId);
      if (conversation?.metadata?.last_content) {
        return {
          success: true,
          content: conversation.metadata.last_content,
          isComplete: false
        };
      }
      
      // Try to reconstruct from any saved tokens (if you still have them)
      try {
        const reconstructedContent = await ChatStorageManager.reconstructContentFromTokens(conversationId);
        if (reconstructedContent) {
          return {
            success: true,
            content: reconstructedContent,
            isComplete: false
          };
        }
      } catch (error) {
        console.warn('⚠️ Could not reconstruct from tokens:', error);
      }
      
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
  
  private static async getCompleteResponse(conversationId: string) {
    // Implementation to get complete response from chat_responses table
  }
  
  private static async getConversation(conversationId: string) {
    // Implementation to get conversation with last_content
  }
  
  /**
   * Check if a conversation needs recovery using ChatStorageManager
   */
  static async needsRecovery(conversationId: string): Promise<boolean> {
    try {
      const conversation = await ChatStorageManager.getConversation(conversationId);
      if (!conversation) {
        return false;
      }
      
      // Check if conversation is active and not complete
      const isComplete = await ChatStorageManager.isConversationComplete(conversationId);
      return conversation.status === 'active' && !isComplete;
      
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
    agentContext: any
  ): Promise<Response> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    console.log('🔄 Resuming streaming for conversation:', conversationId);
    
    return fetch(`${supabaseUrl}/functions/v1/agent-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        ...agentContext,
        conversationId,
        resumeStreaming: true
      }),
      // Add a longer timeout for the fetch request
      signal: AbortSignal.timeout(2 * 60 * 1000), // 2 minute timeout
    });
  }
  
  /**
   * Get recovery status for debugging using ChatStorageManager
   */
  static async getRecoveryStatus(conversationId: string): Promise<{
    conversationExists: boolean;
    conversationStatus?: string;
    hasContent: boolean;
    isComplete: boolean;
  }> {
    try {
      const conversation = await ChatStorageManager.getConversation(conversationId);
      
      if (!conversation) {
        return {
          conversationExists: false,
          hasContent: false,
          isComplete: false
        };
      }
      
      const isComplete = await ChatStorageManager.isConversationComplete(conversationId);
      const completeResponse = await ChatStorageManager.getCompleteResponse(conversationId);
      const hasContent = !!(completeResponse?.full_content || conversation.metadata?.last_content);
      
      console.log('📊 Recovery status:', {
        conversationId,
        conversationExists: true,
        conversationStatus: conversation.status,
        hasContent,
        isComplete
      });
      
      return {
        conversationExists: true,
        conversationStatus: conversation.status,
        hasContent,
        isComplete
      };
      
    } catch (error) {
      console.error('Failed to get recovery status:', error);
      return {
        conversationExists: false,
        hasContent: false,
        isComplete: false
      };
    }
  }
  
  /**
   * Clean up failed or abandoned conversations using ChatStorageManager
   */
  static async cleanupFailedConversations(daysOld: number = 30): Promise<void> {
    try {
      console.log('🧹 Cleaning up old conversations...');
      await ChatStorageManager.cleanupOldConversations(daysOld);
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup conversations:', error);
    }
  }
  
  /**
   * Get incremental tokens since last recovery
   */
  static async getIncrementalTokens(
    conversationId: string,
    lastTokenIndex: number = -1
  ): Promise<{
    tokens: any[];
    latestContent: string;
    hasNewTokens: boolean;
  }> {
    try {
      const tokens = await ChatStorageManager.getTokensAfterIndex(conversationId, lastTokenIndex);
      
      // Filter content tokens and get the latest content
      const contentTokens = tokens
        .filter(token => token.token_type === 'content')
        .sort((a, b) => a.token_index - b.token_index);
      
      const latestContent = contentTokens.length > 0 
        ? contentTokens[contentTokens.length - 1].token_content
        : '';
      
      return {
        tokens,
        latestContent,
        hasNewTokens: tokens.length > 0
      };
      
    } catch (error) {
      console.error('Failed to get incremental tokens:', error);
      return {
        tokens: [],
        latestContent: '',
        hasNewTokens: false
      };
    }
  }
  
  /**
   * Validate conversation integrity
   */
  static async validateConversationIntegrity(conversationId: string): Promise<{
    isValid: boolean;
    issues: string[];
    canRecover: boolean;
  }> {
    const issues: string[] = [];
    
    try {
      // Check if conversation exists
      const conversation = await ChatStorageManager.getConversation(conversationId);
      if (!conversation) {
        issues.push('Conversation not found');
        return { isValid: false, issues, canRecover: false };
      }
      
      // Check for complete response
      const completeResponse = await ChatStorageManager.getCompleteResponse(conversationId);
      if (completeResponse && completeResponse.is_complete) {
        // Conversation is complete and valid
        return { isValid: true, issues, canRecover: true };
      }
      
      // Check for partial content
      const hasPartialContent = !!(conversation.metadata?.last_content);
      if (!hasPartialContent) {
        issues.push('No content found');
      }
      
      // Check if conversation is in a recoverable state
      const canRecover = conversation.status === 'active' || 
                        (conversation.status === 'failed' && hasPartialContent);
      
      return {
        isValid: issues.length === 0,
        issues,
        canRecover
      };
      
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues, canRecover: false };
    }
  }
}
