@@ .. @@
 import { motion, AnimatePresence } from 'framer-motion';
 import { ChatMessage } from '../../types';
 
-import { Bot, User, Sparkles, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
+import { Bot, User, Sparkles, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
 import { ConversationStarters } from './ConversationStarters';
 
 // Ensure we have a proper type for ChatMessage
@@ .. @@
     <div 
       ref={scrollRef} 
       className="flex-1 overflow-y-auto px-3 py-4 bg-transparent"
-      style={{ maxHeight: 'calc(100vh - 200px)' }}
+      style={{ maxHeight: 'calc(100vh - 220px)' }}
     >
-      {(!messages || messages.length === 0) && !currentResponse ? (
+      {/* Debug info - only in development */}
+      {import.meta.env.DEV && currentResponse?.debug && (
+        <div className="mb-4 p-2 bg-gray-100 rounded-lg text-xs text-gray-500 border border-gray-200">
+          <div className="flex items-center gap-1 mb-1">
+            <Info className="w-3 h-3" />
+            <span className="font-medium">Debug Info</span>
+          </div>
+          <div>ConversationId: {currentResponse.debug.hasConversationId ? '✅' : '❌'}</div>
+          <div>History: {currentResponse.debug.historyMessageCount} messages</div>
+          <div>Auth: {currentResponse.debug.isAuthenticated ? '✅' : '❌'}</div>
+          <div>Project: {currentResponse.debug.projectId?.substring(0, 8) || 'none'}</div>
+          <div>Stage: {currentResponse.debug.stageId || 'none'}</div>
+        </div>
+      )}
+      
+      {(!messages || messages.length === 0) && !currentResponse?.content ? (
         <div className="flex flex-col justify-center h-full py-8">
           <ConversationStarters onSelect={onSuggestionClick || (() => {})} />
         </div>