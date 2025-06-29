/**
 * uxReview.ts
 * 
 * TypeScript interfaces for the UX Review & User Check stage.
 * Defines the data structures used for tracking completion status,
 * AI feedback, and user test scenarios.
 */

export interface CompletionItem {
  id: string;
  stageId: string;
  stageName: string;
  category: string;
  item: string;
  status: 'complete' | 'partial' | 'missing';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface AIFeedback {
  id: string;
  type: 'suggestion' | 'warning' | 'enhancement' | 'validation';
  category: string;
  title: string;
  description: string;
  actionable: boolean;
  stageId?: string;
}

export interface UserTestScenario {
  id: string;
  persona: string;
  scenario: string;
  steps: string[];
  expectedOutcome: string;
  frictionPoints: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface UXReviewFormData {
  reviewMode: string;
  showIncompleteOnly: boolean;
  autoScanEnabled: boolean;
  lastScanTime: Date | null;
  reviewNotes: string;
  readyForExport: boolean;
  completionItems: CompletionItem[];
  aiFeedback: AIFeedback[];
  userTestScenarios: UserTestScenario[];
  overallProgress: number;
  stageScores?: Record<string, number>;
  missingItems?: Array<{
    stage: string;
    item: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  inconsistencies?: Array<{
    description: string;
    stages: string[];
    recommendation: string;
  }>;
  recommendations?: Array<{
    type: 'improvement' | 'fix' | 'enhancement';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;
  readinessAssessment?: {
    readyForDevelopment: boolean;
    blockers: string[];
    nextSteps: string[];
  };
}