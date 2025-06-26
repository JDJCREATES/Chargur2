import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { Sidebar } from "./components/layout/Sidebar";
import { Canvas } from "./components/layout/Canvas";
import { useAppStore } from "./store/useAppStore";
import { useAgentChat } from "./hooks/useAgentChat";
import { LoginModal } from './components/auth/LoginModal';

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
        className={`flex-1 transition-all duration-300 ${
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
      </div>

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
