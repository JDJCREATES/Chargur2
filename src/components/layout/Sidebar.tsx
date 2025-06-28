import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Folder, MessageSquare } from 'lucide-react';
import { GiUnplugged, GiBatteries } from 'react-icons/gi';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ChatHistory } from '../ui/ChatHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { Settings } from '../ui/Settings';
import { ProjectManager } from '../ui/ProjectManager';
import { IdeationDiscovery } from '../stages/content/IdeationDiscovery';
import { FeaturePlanning } from '../stages/content/FeaturePlanning';
import { StructureFlow } from '../stages/content/StructureFlow';
import { InterfaceInteraction } from '../stages/content/InterfaceInteraction';
import { ArchitectureDesign } from '../stages/content/ArchitectureDesign';
import { UserAuthFlow } from '../stages/content/UserAuthFlow';
import { UXReviewUserCheck } from '../stages/content/UXReviewUserCheck';
import { AutoPromptEngine } from '../stages/content/AutoPromptEngine';
import { ExportPanel } from '../export/ExportPanel';
import { Stage, ChatMessage } from '../../types';


interface AgentChatProps {
  sendMessage: (message: string) => void;
  historyMessages: ChatMessage[];
  content: string;
  suggestions: string[];
  autoFillData: any;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isStreaming: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  agentChat: AgentChatProps;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  agentChat
}) => {
  // State to control active tab
  const [activeTab, setActiveTab] = useState<'stages' | 'chat'>('stages');

  // Get data from store instead of props:
  const { 
    stages, 
    currentStageId,
    projectId,
    stageData, 
    getCurrentStage,
    goToStage,
    completeStage,
    updateStageData
  } = useAppStore();

  const currentStage = getCurrentStage();

  const handleSendMessage = (content: string) => {
    agentChat.sendMessage(content);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleRetry = () => {
    agentChat.retry();
  };

  const renderStageForm = () => {
    if (!currentStage) return null;

    switch (currentStage.id) {
      case 'ideation-discovery':
        return (
          <IdeationDiscovery
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'feature-planning':
        return (
          <FeaturePlanning
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
            onSendMessage={handleSendMessage}
          />
        );
      case 'structure-flow':
        return (
          <StructureFlow
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'interface-interaction':
        return (
          <InterfaceInteraction
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'architecture-design':
        return (
          <ArchitectureDesign
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'user-auth-flow':
        return (
          <UserAuthFlow
            stage={currentStage}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'ux-review-check':
        return (
          <UXReviewUserCheck
            stage={currentStage}
            stages={stages}
            stageData={stageData}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
            onGoToStage={goToStage}
          />
        );
      case 'auto-prompt-engine':
        return (
          <AutoPromptEngine
            stage={currentStage}
            stages={stages}
            stageData={stageData}
            initialFormData={stageData[currentStage.id]}
            onComplete={() => completeStage(currentStage.id)}
            onUpdateData={(data: any) => updateStageData(currentStage.id, data)}
          />
        );
      case 'export-handoff':
        return (
          <ExportPanel
            stages={stages}
            stageData={stageData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full z-50">
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: isOpen ? 0 : 320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg"
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -left-12 top-4 w-12 h-12 bg-white border border-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
        >
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-full p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
              <ProjectManager />
            </div>  
          </div>
          
          {/* Tab Navigation */}
          <div className={`flex border-t border-gray-200 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setActiveTab('stages')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stages' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GiBatteries className="w-4 h-4" />
              <span>Stages</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chat' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GiUnplugged className="w-4 h-4" />
              <span>Charg</span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {activeTab === 'stages' ? (
            <>
              {/* Stage Form */}
              <div className="flex-1 overflow-y-auto space-y-2">
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <div className="flex items-center gap-2">
                      <Typography className="font-medium text-sm">{currentStage ? currentStage.title : 'Current Stage Details'}</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="space-y-2">
                      {renderStageForm()}
                    </div>
                  </AccordionDetails>
                </Accordion>
              </div>
              
              {/* Settings */}
              <div className="border-t border-gray-200">
                <Accordion>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <div className="flex items-center gap-2">
                      <Typography className="font-medium text-sm">Settings</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Settings />
                  </AccordionDetails>
                </Accordion>
              </div>
            </>
          ) : (
            <>
              {/* Chat Interface */}
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                  <ChatHistory
                    messages={agentChat.historyMessages || []}
                    currentResponse={
                      agentChat.content || agentChat.isLoading
                        ? {
                            content: agentChat.content,
                            isComplete: agentChat.isComplete,
                            suggestions: agentChat.suggestions,
                            isStreaming: agentChat.isStreaming,
                            error: agentChat.error
                          }
                        : undefined
                    }
                    onSuggestionClick={handleSuggestionClick}
                    onRetry={handleRetry}
                  />
                </div>
                <div className="border-t border-gray-100">
                  <ChatInterface
                    onSendMessage={handleSendMessage}
                    isLoading={agentChat.isLoading}
                    error={agentChat.error}
                    onRetry={handleRetry}
                    disabled={!currentStage}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Collapsed Sidebar - Vertical Stage Bubbles */}
      {!isOpen && (
        <></>
      )}
    </div>
  );
};