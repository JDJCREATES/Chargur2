import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { GiUnplugged } from 'react-icons/gi';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
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

import { StageProgressBubbles } from '../ui/StageProgressBubbles';

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
  // State to control chat accordion expansion
  const [isChatAccordionExpanded, setIsChatAccordionExpanded] = useState(true);

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

  // Effect to automatically expand chat accordion when messages are sent or received
  useEffect(() => {
    // Only expand if the sidebar is open and there's activity in the chat
    if (isOpen && (agentChat.isLoading || agentChat.isStreaming || agentChat.content)) {
      // Expand the chat accordion
      setIsChatAccordionExpanded(true);
    }
  }, [
    isOpen, agentChat.isLoading, agentChat.isStreaming, agentChat.content, projectId
  ]);

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
        animate={{ x: isOpen ? 0 : 268 }}
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
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-full transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
              <ProjectManager />
            </div>  
          </div>
        </div>

        {/* Stage Progress */}
        <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-4 border-b border-gray-200">
            <StageProgressBubbles 
              stages={stages} 
              onStageClick={goToStage}
              orientation="horizontal"
              size="md"
            />
          </div>
        </div>

        {/* Stage Form */}
        <div className={`flex-1 overflow-y-auto transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {renderStageForm()}
        </div>

        {/* AI Assistant */}
        <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Accordion 
            expanded={isChatAccordionExpanded}
            onChange={(_, expanded) => setIsChatAccordionExpanded(expanded)}
          >
            <AccordionSummary
              expandIcon={<ChevronDown size={20} />}
              aria-controls="ai-assistant-content"
              id="ai-assistant-header"
              className="border-t border-gray-200"
            >
              <div className="flex items-center gap-2">
                <GiUnplugged className="w-5 h-5 text-teal-500" />
                <Typography className="font-semibold text-gray-800 font-nova-round">Charg</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className="p-0">
              <div className="flex flex-col max-h-[400px] bg-gray-25">
                <ChatHistory
                  messages={agentChat.historyMessages || []}
                  currentResponse={
                    agentChat.content || agentChat.isLoading
                      ? {
                          content: agentChat.content,
                          isComplete: agentChat.isComplete,
                          suggestions: agentChat.suggestions,
                          isStreaming: agentChat.isStreaming,
                          error: agentChat.error,
                        }
                      : undefined
                  }
                  onSuggestionClick={handleSuggestionClick}
                  onRetry={handleRetry}
                />
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
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Settings */}
        <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ChevronDown size={20} />}
              aria-controls="settings-content"
              id="settings-header"
              className="border-t border-gray-200"
            >
              <Typography className="font-semibold text-gray-800">Settings</Typography>
            </AccordionSummary>
            <AccordionDetails className="p-0">
              <Settings />
            </AccordionDetails>
          </Accordion>
        </div>
      </motion.div>
      
      {/* Collapsed Sidebar - Vertical Stage Bubbles */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="fixed right-12 top-20 z-40"
        >
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
            <StageProgressBubbles 
              stages={stages} 
              onStageClick={goToStage}
              orientation="vertical"
              size="sm"
              showLabels={false}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};