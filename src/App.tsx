import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAgentChat } from './hooks/useAgentChat';
import { AgentContextProvider } from './components/agent/AgentContextProvider';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/layout/Canvas';
import { useStageManager } from './hooks/useStageManager';

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

  // Initialize agent chat for the current stage
  const {
    sendMessage,
    isLoading: agentLoading,
    error: agentError,
  } = useAgentChat({
    stageId: currentStage?.id || '',
    currentStageData: currentStage ? stageData[currentStage.id] : {},
    allStageData: stageData,
    onAutoFill: (data) => {
      if (currentStage) {
        updateStageData(currentStage.id, data);
      }
    },
    onStageComplete: () => {
      if (currentStage) {
        completeStage(currentStage.id);
      }
    },
  });

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

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
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
            onUpdateStageData={updateStageData}
            onCompleteStage={completeStage}
            onGoToStage={goToStage}
            getNextStage={() => getNextStage()}
            onOpenSidebar={openSidebar}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          stages={stages}
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