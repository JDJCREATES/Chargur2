import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { GiUnplugged } from 'react-icons/gi';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChatHistory } from '../ui/ChatHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { Settings } from '../ui/Settings';
import { Avatar } from '../ui/Avatar';
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
import { useAgentChat } from '../../hooks/useAgentChat';
import { useAgent } from '../agent/AgentContextProvider';

// Import the enhanced StageProgressBubbles component
import { StageProgressBubbles } from '../ui/StageProgressBubbles';

interface SidebarProps {
  stages: Stage[];
  currentStage?: Stage;
  stageData: any;
  onStageClick: (stageId: string) => void;
  onCompleteStage: (stageId: string) => void;
  onUpdateStageData: (stageId: string, data: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stages,
  currentStage,
  stageData,
  onStageClick,
  onCompleteStage,
  onUpdateStageData,
  isOpen,
  onToggle,
}) => {
  const { agentState, updateAgentMemory, getStageRecommendations, memory, recommendations } = useAgent();
  
  const agentChat = useAgentChat({
    stageId: currentStage?.id || '',
    currentStageData: stageData,
    allStageData: stageData,
    useDirectLLM: false,
    llmProvider: 'openai',
    memory: memory,
    recommendations: recommendations,
    onAutoFill: (data) => {
      if (currentStage?.id) {
        onUpdateStageData(currentStage.id, data);
        // Update global agent memory
        updateAgentMemory(currentStage.id, data);
        console.log('Sidebar Agent Chat -> Auto-filled data:', data);
      }
    },
    onStageComplete: () => {
      if (currentStage?.id) {
        onCompleteStage(currentStage.id);
        // Update agent memory that stage is complete
        updateAgentMemory(currentStage.id, { completed: true, completedAt: new Date().toISOString() });
      }
    },
  });

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
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'feature-planning':
        return (
          <FeaturePlanning
            stage={currentStage}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'structure-flow':
        return (
          <StructureFlow
            stage={currentStage}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'interface-interaction':
        return (
          <InterfaceInteraction
            stage={currentStage}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'architecture-design':
        return (
          <ArchitectureDesign
            stage={currentStage}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'user-auth-flow':
        return (
          <UserAuthFlow
            stage={currentStage}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
          />
        );
      case 'ux-review-check':
        return (
          <UXReviewUserCheck
            stage={currentStage}
            stages={stages}
            stageData={stageData}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
            onGoToStage={onStageClick}
          />
        );
      case 'auto-prompt-engine':
        return (
          <AutoPromptEngine
            stage={currentStage}
            stages={stages}
            stageData={stageData}
            onComplete={() => onCompleteStage(currentStage.id)}
            onUpdateData={(data: any) => onUpdateStageData(currentStage.id, data)}
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
            <Avatar size="lg" />
            <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="font-semibold text-gray-800">
                {currentStage ? currentStage.title : 'UX + IA Agent'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentStage ? `Stage ${stages.findIndex(s => s.id === currentStage.id) + 1} of ${stages.length}` : 'Let\'s get started!'}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-4 border-b border-gray-200">
            <StageProgressBubbles 
              stages={stages} 
              onStageClick={onStageClick}
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
          <Accordion>
            <AccordionSummary
              expandIcon={<ChevronDown size={20} />}
              aria-controls="ai-assistant-content"
              id="ai-assistant-header"
              className="border-t border-gray-200"
            >
              <div className="flex items-center gap-2">
                <GiUnplugged className="w-4 h-4 text-teal-500" />
                <Typography className="font-semibold text-gray-800">Charg</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className="p-0">
              <div className="flex flex-col max-h-96">
                <ChatHistory
                  messages={agentChat.historyMessages}
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
                <ChatInterface
                  onSendMessage={handleSendMessage}
                  isLoading={agentChat.isLoading}
                  error={agentChat.error}
                  onRetry={handleRetry}
                  disabled={!currentStage}
                />
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
              onStageClick={onStageClick}
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