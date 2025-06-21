import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { AgentContextProvider } from './components/agent/AgentContextProvider';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/layout/Canvas';
import { useStageManager } from './hooks/useStageManager';
import { ChatMessage } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { loading: authLoading } = useAuth();
  const {
    stages,
    currentStage,
    stageData,
    goToStage,
    completeStage,
    updateStageData,
    getNextStage,
  } = useStageManager();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type: 'user',
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "Thanks for sharing your idea! I'm processing your input and will help you develop this concept further. This is just the beginning of our design journey together.",
      timestamp: new Date(),
      type: 'assistant',
    };

    setChatHistory(prev => [...prev, userMessage, assistantMessage]);
  };

  return (
    <AgentContextProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-12'}`}>
          <Canvas
            currentStage={currentStage}
            stageData={stageData}
            onSendMessage={handleSendMessage}
            onUpdateStageData={updateStageData}
            onCompleteStage={completeStage}
            onGoToStage={goToStage}
            getNextStage={() => getNextStage()}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          stages={stages}
          chatHistory={chatHistory}
          currentStage={currentStage}
          stageData={stageData}
          onStageClick={goToStage}
          onCompleteStage={completeStage}
          onUpdateStageData={updateStageData}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
      </div>
    </AgentContextProvider>
  );
}

export default App;