import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentContextProvider } from './components/agent/AgentContextProvider';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/layout/Canvas';
import { useStageManager } from './hooks/useStageManager';
import { ChatMessage } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    stages,
    currentStage,
    stageData,
    goToStage,
    completeStage,
    updateStageData,
  } = useStageManager();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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
            getNextStage={getNextStage}
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