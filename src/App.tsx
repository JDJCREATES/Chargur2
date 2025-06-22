import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
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


  return (
    <AgentContextProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-12'}`}>
          <Canvas
            currentStage={currentStage}
            stageData={stageData}
            onSendMessage={() => {}} // No longer needed in Canvas
            onUpdateStageData={updateStageData}
            onCompleteStage={completeStage}
            onGoToStage={goToStage}
            getNextStage={() => getNextStage()}
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