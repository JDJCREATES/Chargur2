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
      console.log('🔄 Attempting to recover conversation using ChatStorageManager:', conversationId);
      
      // First, check if the conversation exists and get its status
      const conversation = await ChatStorageManager.getConversation(conversationId);
      if (!conversation) {
        console.log('❌ Conversation not found');
        return {
          success: false,
          error: 'Conversation not found'
        };
      }
      
      console.log('✅ Conversation found with status:', conversation.status);
      
      // Try to get the complete response first
      const completeResponse = await ChatStorageManager.getCompleteResponse(conversationId);
      
      if (completeResponse && completeResponse.is_complete) {
        console.log('✅ Complete response found, returning it');
        return {
          success: true,
          content: completeResponse.full_content,
          suggestions: completeResponse.suggestions || [],
          autoFillData: completeResponse.auto_fill_data || {},
          stageComplete: completeResponse.stage_complete || false,
          isComplete: true
        };
      }
      
      // If no complete response, try to reconstruct from tokens
      console.log('🔧 No complete response found, reconstructing from tokens...');
      const reconstructedContent = await ChatStorageManager.reconstructContentFromTokens(conversationId);
      
      if (reconstructedContent) {
        console.log('✅ Content reconstructed from tokens');
        return {
          success: true,
          content: reconstructedContent,
          suggestions: [],
          autoFillData: {},
          stageComplete: false,
          isComplete: false
        };
      }
      
      // No content to recover, but conversation exists
      console.log('⚠️ Conversation exists but no content found');
      return {
        success: true,
        content: '',
        suggestions: [],
        autoFillData: {},
        stageComplete: false,
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
    
    // Get the last token index using ChatStorageManager
    const lastTokenIndex = await ChatStorageManager.getLastTokenIndex(conversationId);
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
   * Get recovery status for debugging using ChatStorageManager
   */
  static async getRecoveryStatus(conversationId: string): Promise<{
    conversationExists: boolean;
    conversationStatus?: string;
    tokenCount: number;
    isComplete: boolean;
    lastTokenIndex: number;
  }> {
    try {
      const conversation = await ChatStorageManager.getConversation(conversationId);
      
      if (!conversation) {
        return {
          conversationExists: false,
          tokenCount: 0,
          isComplete: false,
          lastTokenIndex: -1
        };
      }
      
      const isComplete = await ChatStorageManager.isConversationComplete(conversationId);
      const lastTokenIndex = await ChatStorageManager.getLastTokenIndex(conversationId);
      const tokens = await ChatStorageManager.getTokensAfterIndex(conversationId, -1);
      
      console.log('📊 Recovery status:', {
        conversationId,
        conversationExists: true,
        conversationStatus: conversation.status,
        tokenCount: tokens.length,
        isComplete,
        lastTokenIndex
      });
      
      return {
        conversationExists: true,
        conversationStatus: conversation.status,
        tokenCount: tokens.length,
        isComplete,
        lastTokenIndex
      };
      
    } catch (error) {
      console.error('Failed to get recovery status:', error);
      return {
        conversationExists: false,
        tokenCount: 0,
        isComplete: false,
        lastTokenIndex: -1
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
      
      // Check for tokens
      const tokens = await ChatStorageManager.getTokensAfterIndex(conversationId, -1);
      if (tokens.length === 0) {
        issues.push('No tokens found');
      }
      
      // Check for gaps in token sequence
      const tokenIndexes = tokens.map(t => t.token_index).sort((a, b) => a - b);
      for (let i = 1; i < tokenIndexes.length; i++) {
        if (tokenIndexes[i] !== tokenIndexes[i-1] + 1) {
          issues.push(`Token sequence gap between ${tokenIndexes[i-1]} and ${tokenIndexes[i]}`);
        }
      }
      
      // Check if conversation is in a recoverable state
      const canRecover = conversation.status === 'active' || 
                        (conversation.status === 'failed' && tokens.length > 0);
      
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
