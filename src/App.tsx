import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentContextProvider } from './components/agent/AgentContextProvider';
import { AgentMemoryStream } from './components/agent/AgentMemoryStream';
import { AgentQuickStart } from './components/agent/AgentQuickStart';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/layout/Canvas';
import { useStageManager } from './hooks/useStageManager';
import { ChatMessage } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [quickStartPrompt, setQuickStartPrompt] = useState('');
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (content: string) => {
    // Check if this looks like an app idea prompt
    const isAppIdeaPrompt = content.toLowerCase().includes('build an app') || 
                           content.toLowerCase().includes('app about') ||
                           content.toLowerCase().includes('create an app');
    
    if (isAppIdeaPrompt && currentStage?.id === 'ideation-discovery') {
      setQuickStartPrompt(content);
      setShowQuickStart(true);
      return;
    }

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

  const handleQuickStartComplete = (data: any) => {
    updateStageData('ideation-discovery', data);
    setShowQuickStart(false);
    
    // Auto-complete the stage if enough data is provided
    if (data.appIdea && data.appName && data.problemStatement) {
      setTimeout(() => {
        completeStage('ideation-discovery');
      }, 1000);
    }
  };

  const handleQuickStartSkip = () => {
    setShowQuickStart(false);
  };

  const handleNextStage = () => {
    const nextStage = getNextStage();
    if (nextStage) {
      goToStage(nextStage.id);
    }
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

        {/* AI Agent Memory Stream */}
        {currentStage && (
          <AgentMemoryStream
            currentStageId={currentStage.id}
            stageData={stageData}
            onUpdateStageData={updateStageData}
            onStageComplete={completeStage}
            onNextStage={handleNextStage}
          />
        )}

        {/* Quick Start Modal */}
        {showQuickStart && (
          <AgentQuickStart
            initialPrompt={quickStartPrompt}
            onComplete={handleQuickStartComplete}
            onSkip={handleQuickStartSkip}
          />
        )}
      </div>
    </AgentContextProvider>
  );
}

export default App;