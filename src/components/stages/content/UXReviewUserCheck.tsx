import React, { useState, useEffect } from 'react';

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Download, 
  Zap,
  BarChart3,
  Users,
  Lightbulb,
  Edit3,
  MessageSquare,
  Brain,
  Target,
  Star,
  TrendingUp
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage, StageData } from '../../../types';
import { CompletionItem, AIFeedback, UserTestScenario, UXReviewFormData } from '../../../types/uxReview';

interface UXReviewUserCheckProps {
  stage: Stage;
  stages: Stage[];
  stageData: StageData;
  initialFormData?: UXReviewFormData;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
  onGoToStage: (stageId: string) => void;
}

export const UXReviewUserCheck: React.FC<UXReviewUserCheckProps> = ({
  stage,
  stages,
  stageData,
  initialFormData,
  onComplete,
  onUpdateData,
  onGoToStage,
}) => {
  const defaultFormData: UXReviewFormData = {
    reviewMode: 'overview',
    showIncompleteOnly: false,
    autoScanEnabled: true,
    lastScanTime: null,
    reviewNotes: '',
    readyForExport: false,
    completionItems: [],
    aiFeedback: [],
    userTestScenarios: [],
    overallProgress: 0
  };
  
  const [formData, setFormData] = useState<UXReviewFormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'missing': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-700 bg-green-50 border-green-200';
      case 'partial': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'missing': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'enhancement': return <Star className="w-4 h-4 text-purple-600" />;
      case 'validation': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredItems = formData.showIncompleteOnly 
    ? formData.completionItems.filter(item => item.status !== 'complete')
    : formData.completionItems;

  const generateFinalSummary = () => {
    const completeStages = stages.filter(s => s.completed).length;
    const totalFeatures = Object.values(stageData).reduce((acc: number, data: any) => {
      return acc + (data.selectedFeaturePacks?.length || 0) + (data.customFeatures?.length || 0);
    }, 0);
    
    return `
**Final UX Review Summary**

**Project Overview:**
- App Name: ${stageData['ideation-discovery']?.appName || 'Not specified'}
- Target Platform: ${stageData['ideation-discovery']?.platform || 'Not specified'}
- Core Problem: ${stageData['ideation-discovery']?.problemStatement || 'Not specified'}

**Completion Status:**
- Stages Completed: ${completeStages}/${stages.length}
- Overall Progress: ${formData.overallProgress}%
- Total Features Planned: ${totalFeatures}
- Critical Issues: ${formData.completionItems.filter(i => i.status === 'missing' && i.priority === 'high').length}

**AI Feedback Summary:**
- Suggestions: ${formData.aiFeedback.filter(f => f.type === 'suggestion').length}
- Warnings: ${formData.aiFeedback.filter(f => f.type === 'warning').length}
- Enhancements: ${formData.aiFeedback.filter(f => f.type === 'enhancement').length}

**Readiness Assessment:**
${formData.overallProgress >= 80 ? '✅ Ready for export and development' : '⚠️ Needs additional work before development'}

**Next Steps:**
${formData.overallProgress >= 80 
  ? '1. Export to Bolt.new\n2. Generate project scaffolding\n3. Begin development'
  : '1. Complete missing high-priority items\n2. Address AI feedback warnings\n3. Re-run review scan'
}
    `.trim();
  };

  const isReadyForExport = formData.overallProgress >= 80 && 
                          formData.completionItems.filter(i => i.status === 'missing' && i.priority === 'high').length === 0;

  return (
    <div className="p-2 space-y-2">

      {/* 7.1 Completion Check */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Completion Check</Typography>
            <div className="ml-auto mr-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                formData.overallProgress >= 80 ? 'bg-green-100 text-green-700' : 
                formData.overallProgress >= 60 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {formData.overallProgress}% Complete
              </span>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Overall Progress</h4>
                <div className="flex gap-2">
                  {/* Toggle button for showing incomplete items only */}
                  {formData.completionItems.length > 0 && (
                    <button
                      onClick={() => updateFormData('showIncompleteOnly', !formData.showIncompleteOnly)}
                      className={`text-xs px-2 py-1 rounded ${
                        formData.showIncompleteOnly 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-200 text-blue-700'
                      }`}
                    >
                      {formData.showIncompleteOnly ? 'Show All' : 'Show Incomplete Only'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${formData.overallProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formData.completionItems.filter(i => i.status === 'complete').length}
                  </div>
                  <div className="text-green-700">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {formData.completionItems.filter(i => i.status === 'partial').length}
                  </div>
                  <div className="text-yellow-700">Partial</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {formData.completionItems.filter(i => i.status === 'missing').length}
                  </div>
                  <div className="text-red-700">Missing</div>
                </div>
              </div>
            </div>

            {/* Completion Items */}
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.item}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="text-xs opacity-75 mt-1">{item.description}</div>
                        <div className="text-xs opacity-60 mt-1">{item.stageName} → {item.category}</div>
                      </div>
                    </div>
                    {item.status !== 'complete' && (
                      <button
                        onClick={() => onGoToStage(item.stageId)}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
                      >
                        <Edit3 className="w-3 h-3" />
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 7.2 Stage Progress Display */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Stage Progress Display</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {stages.map((stage, index) => {
                const stageItems = formData.completionItems.filter(item => item.stageId === stage.id);
                const completeItems = stageItems.filter(item => item.status === 'complete').length;
                const stageProgress = stageItems.length > 0 ? Math.round((completeItems / stageItems.length) * 100) : 0;
                
                return (
                  <div key={stage.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stage.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stage.completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-green-800">{stage.title}</span>
                        <span className="text-xs text-green-600">{stageProgress}%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stageProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {completeItems}/{stageItems.length} items complete
                      </div>
                    </div>
                    <button
                      onClick={() => onGoToStage(stage.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Eye className="w-3 h-3" />
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 7.3 AI Feedback Summary */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">AI Feedback Summary</Typography>
            <div className="ml-auto mr-4">
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {formData.aiFeedback.length} insights
              </span>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-purple-800 mb-2">AI Analysis</h4>
              <p className="text-sm text-purple-700">
                Based on your project configuration, here are AI-generated insights and recommendations 
                to improve your app's design and user experience.
              </p>
            </div>

            <div className="space-y-2">
              {formData.aiFeedback.map((feedback) => (
                <div key={feedback.id} className="p-3 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getFeedbackIcon(feedback.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{feedback.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          feedback.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                          feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                          feedback.type === 'enhancement' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {feedback.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{feedback.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{feedback.category}</span>
                        {feedback.actionable && feedback.stageId && (
                          <button
                            onClick={() => onGoToStage(feedback.stageId!)}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 7.4 Mini User Test Simulation */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">Mini User Test Simulation</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-teal-800 mb-2">User Journey Validation</h4>
              <p className="text-sm text-teal-700">
                Simulated user scenarios to identify potential friction points and UX issues 
                before development begins.
              </p>
            </div>

            <div className="space-y-3">
              {formData.userTestScenarios.length > 0 ? (
                <div className="space-y-3">
                  {formData.userTestScenarios.map((scenario) => (
                    <div key={scenario.id} className="p-3 bg-teal-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm text-teal-800">{scenario.persona}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${
                          scenario.status === 'completed' ? 'bg-green-100 text-green-700' :
                          scenario.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {scenario.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-teal-700 mb-2">{scenario.scenario}</p>
                      
                      <div className="text-xs text-teal-600 mb-2">
                        <strong>Expected:</strong> {scenario.expectedOutcome}
                      </div>
                      
                      {scenario.frictionPoints.length > 0 && (
                        <div className="text-xs">
                          <strong className="text-teal-700">Potential Friction Points:</strong>
                          <ul className="list-disc list-inside text-teal-600 mt-1">
                            {scenario.frictionPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className={`font-medium ${isReadyForExport ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isReadyForExport ? 'Ready for Export!' : 'Needs Additional Work'}
                  </h4>
                  <p className={`text-sm ${isReadyForExport ? 'text-green-700' : 'text-yellow-700'}`}>
                    {isReadyForExport 
                      ? 'Your project is complete and ready for development. You can now export to Bolt.new or generate project files.'
                      : 'Please address the missing high-priority items and warnings before proceeding to export.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 7.5 Review Notes & Final Summary */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Final Review Summary</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Review Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
              <textarea
                value={formData.reviewNotes}
                onChange={(e) => updateFormData('reviewNotes', e.target.value)}
                placeholder="Add any final notes or observations about the project..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Final Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Project Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateFinalSummary()}</pre>
            </div>

            {/* Readiness Check */}
            <div className={`p-4 rounded-lg border-2 ${
              isReadyForExport 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {isReadyForExport ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <h4 className={`font-medium ${
                  isReadyForExport ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {isReadyForExport ? 'Ready for Export!' : 'Needs Additional Work'}
                </h4>
              </div>
              <p className={`text-sm ${
                isReadyForExport ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isReadyForExport 
                  ? 'Your project is complete and ready for development. You can now export to Bolt.new or generate project files.'
                  : 'Please address the missing high-priority items and warnings before proceeding to export.'
                }
              </p>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                disabled={!isReadyForExport}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  isReadyForExport
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                Export Summary
              </button>
              <button 
                disabled={!isReadyForExport}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  isReadyForExport
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
              <button 
                disabled={!isReadyForExport}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  isReadyForExport
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                Send to Bolt
              </button>
              <button
                onClick={onComplete}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Target className="w-4 h-4" />
                Complete Review
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};