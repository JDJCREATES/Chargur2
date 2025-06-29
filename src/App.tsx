import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { Canvas } from "./components/layout/Canvas";
import { Sidebar } from "./components/layout/Sidebar";
import { useAppStore } from "./store/useAppStore";
import { useAgentChat } from "./hooks/useAgentChat";
import { LoginModal } from './components/auth/LoginModal';
import { StageProgressBubbles } from './components/ui/StageProgressBubbles';
import { Logo } from './components/layout/Logo';
import { BoltBadge } from './components/ui/BoltBadge';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { loading: authLoading, user } = useAuth();

  // Get state and actions from the store
  const {
    stages,
    currentStageId,
    stageData,
    canvasNodes,
    canvasConnections,
    isLoading: projectLoading,
    error: projectError,
    getCurrentStage,
    goToStage,
    completeStage,
    updateStageData,
    getNextStage,
    updateCanvasNodes,
    updateCanvasConnections,
    initializeProject,
    projectId,
  } = useAppStore();

  // Get the current stage object
  const currentStage = getCurrentStage();

  // Initialize project when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Initializing project for user:', user.id);
      initializeProject(user.id);
    }
  }, [authLoading, user, initializeProject]);

  // Initialize agent chat
  const {
    sendMessage,
    historyMessages,
    content,
    suggestions,
    autoFillData,
    isComplete,
    isLoading: agentLoading,
    error: agentError,
    retry,
    isStreaming,
  } = useAgentChat({
    stageId: currentStage?.id || "",
    projectId: projectId || "",
    currentStageData: currentStage ? stageData[currentStage.id] : {},
    allStageData: stageData,
    onAutoFill: (data) => {
      if (currentStage) {
        updateStageData(currentStageId, data);
      }
    },
    onStageComplete: () => {
      if (currentStage) {
        completeStage(currentStageId);
        const nextStage = getNextStage();
        if (nextStage) {
          goToStage(nextStage.id);
        }
      }
    },
    onGoToStage: (stageId) => {
      goToStage(stageId);
    },
  });

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show LoginModal if not authenticated
  if (!user) {
    return <LoginModal isOpen={true} onClose={() => {}} />;
  }

  // Show project loading
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error screen if project loading failed
  if (projectError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-4">{projectError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "mr-80" : "mr-12"
        }`}
      >
        <Canvas
          agentChat={{
            sendMessage,
            retry,
            historyMessages,
            content,
            suggestions,
            autoFillData,
            isComplete,
            isLoading: agentLoading,
            error: agentError,
            isStreaming,
          }}
          currentStage={currentStage}
          stageData={stageData}
          canvasNodes={canvasNodes}
          canvasConnections={canvasConnections}
          onUpdateCanvasNodes={updateCanvasNodes}
          onUpdateCanvasConnections={updateCanvasConnections}
          onOpenSidebar={openSidebar}
        />
        
        {/* Progress Bubbles - Positioned at the bottom center, adjusts with sidebar */}
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
          isSidebarOpen ? "-ml-20 " : ""
        }`}>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-3 flex items-center justify-between space-x-4">
            <Logo size="md" />
            <StageProgressBubbles 
              stages={stages} 
              onStageClick={goToStage}
              orientation="horizontal"
              size="md"
            />
          </div>
        </div>
      </div>
      
      {/* Bolt.new Badge */}
      <BoltBadge />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        agentChat={{
          sendMessage,
          historyMessages,
          content,
          suggestions,
          autoFillData,
          isComplete,
          isLoading: agentLoading,
          error: agentError,
          retry,
          isStreaming,
        }}
      />
    </div>
  );
}

export default App;