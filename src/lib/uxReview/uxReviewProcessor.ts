/**
 * uxReviewProcessor.ts
 * 
 * Utility functions for processing UX review data.
 * Analyzes project data across all stages to generate completion metrics,
 * AI feedback, and user test scenarios.
 */

import { Stage, StageData } from '../../types';
import { CompletionItem, AIFeedback, UserTestScenario, UXReviewFormData } from '../../types/uxReview';

/**
 * Main function to process UX review data
 */
export function processUXReviewData(
  stages: Stage[],
  stageData: StageData,
  currentFormData?: Partial<UXReviewFormData>
): UXReviewFormData {
  try {
    // Generate completion items
    const completionItems = performCompletionScan(stages, stageData);
    
    // Calculate overall progress
    const completeItems = completionItems.filter(item => item.status === 'complete').length;
    const partialItems = completionItems.filter(item => item.status === 'partial').length;
    const overallProgress = Math.round(((completeItems + partialItems * 0.5) / Math.max(completionItems.length, 1)) * 100);
    
    // Generate AI feedback
    const aiFeedback = generateAIFeedback(stageData);
    
    // Generate user test scenarios
    const userTestScenarios = generateUserTestScenarios(stageData);
    
    // Calculate stage scores
    const stageScores = calculateStageScores(stages, completionItems);
    
    // Generate missing items
    const missingItems = generateMissingItems(completionItems);
    
    // Generate inconsistencies
    const inconsistencies = generateInconsistencies(stageData);
    
    // Generate recommendations
    const recommendations = generateRecommendations(stageData, completionItems, aiFeedback);
    
    // Generate readiness assessment
    const readinessAssessment = generateReadinessAssessment(overallProgress, completionItems, aiFeedback);
    
    // Merge with current form data to preserve user edits
    return {
      reviewMode: currentFormData?.reviewMode || 'overview',
      showIncompleteOnly: currentFormData?.showIncompleteOnly || false,
      autoScanEnabled: currentFormData?.autoScanEnabled !== undefined ? currentFormData.autoScanEnabled : true,
      lastScanTime: new Date(),
      reviewNotes: currentFormData?.reviewNotes || '',
      readyForExport: overallProgress >= 80,
      completionItems,
      aiFeedback,
      userTestScenarios,
      overallProgress,
      stageScores,
      missingItems,
      inconsistencies,
      recommendations,
      readinessAssessment
    };
  } catch (error) {
    console.error('Error processing UX review data:', error);
    
    // Return a minimal valid object in case of error
    return {
      reviewMode: currentFormData?.reviewMode || 'overview',
      showIncompleteOnly: currentFormData?.showIncompleteOnly || false,
      autoScanEnabled: currentFormData?.autoScanEnabled !== undefined ? currentFormData.autoScanEnabled : true,
      lastScanTime: new Date(),
      reviewNotes: currentFormData?.reviewNotes || '',
      readyForExport: false,
      completionItems: [],
      aiFeedback: [],
      userTestScenarios: [],
      overallProgress: 0
    };
  }
}

/**
 * Analyze project data to generate completion items
 */
export function performCompletionScan(
  stages: Stage[],
  stageData: StageData
): CompletionItem[] {
  const items: CompletionItem[] = [];
  
  try {
    // Stage 1: Ideation & Discovery
    const ideationData = stageData['ideation-discovery'] || {};
    items.push(
      {
        id: '1-1',
        stageId: 'ideation-discovery',
        stageName: 'Ideation & Discovery',
        category: 'Core Concept',
        item: 'App Idea Description',
        status: ideationData.appIdea ? 'complete' : 'missing',
        priority: 'high',
        description: 'Clear description of what the app does'
      },
      {
        id: '1-2',
        stageId: 'ideation-discovery',
        stageName: 'Ideation & Discovery',
        category: 'Branding',
        item: 'App Name & Tagline',
        status: ideationData.appName && ideationData.tagline ? 'complete' : ideationData.appName ? 'partial' : 'missing',
        priority: 'medium',
        description: 'App name and memorable tagline'
      },
      {
        id: '1-3',
        stageId: 'ideation-discovery',
        stageName: 'Ideation & Discovery',
        category: 'Market Research',
        item: 'Target Users & Problem Statement',
        status: ideationData.problemStatement && 
               (ideationData.targetUsers || (ideationData.userPersonas && ideationData.userPersonas.length > 0)) 
               ? 'complete' : 'missing',
        priority: 'high',
        description: 'Clear problem definition and target audience'
      }
    );

    // Stage 2: Feature Planning
    const featureData = stageData['feature-planning'] || {};
    items.push(
      {
        id: '2-1',
        stageId: 'feature-planning',
        stageName: 'Feature Planning',
        category: 'Features',
        item: 'Core Features Defined',
        status: Array.isArray(featureData.selectedFeaturePacks) && featureData.selectedFeaturePacks.length > 0 || 
                Array.isArray(featureData.customFeatures) && featureData.customFeatures.length > 0 
                ? 'complete' : 'missing',
        priority: 'high',
        description: 'At least 3-5 core features identified'
      },
      {
        id: '2-2',
        stageId: 'feature-planning',
        stageName: 'Feature Planning',
        category: 'Prioritization',
        item: 'Feature Prioritization (MoSCoW)',
        status: Array.isArray(featureData.customFeatures) && 
                featureData.customFeatures.some((f: any) => f.priority === 'must') 
                ? 'complete' : 'partial',
        priority: 'medium',
        description: 'Features categorized by priority'
      }
    );

    // Stage 3: Structure & Flow
    const structureData = stageData['structure-flow'] || {};
    items.push(
      {
        id: '3-1',
        stageId: 'structure-flow',
        stageName: 'Structure & Flow',
        category: 'Architecture',
        item: 'Screen Structure Defined',
        status: Array.isArray(structureData.screens) && structureData.screens.length > 0 ? 'complete' : 'missing',
        priority: 'high',
        description: 'All main screens and navigation defined'
      },
      {
        id: '3-2',
        stageId: 'structure-flow',
        stageName: 'Structure & Flow',
        category: 'Data',
        item: 'Data Models & User Flows',
        status: Array.isArray(structureData.dataModels) && structureData.dataModels.length > 0 && 
                Array.isArray(structureData.userFlows) && structureData.userFlows.length > 0 
                ? 'complete' : 'partial',
        priority: 'high',
        description: 'Database models and user journey flows'
      }
    );

    // Stage 4: Interface & Interaction
    const interfaceData = stageData['interface-interaction'] || {};
    items.push(
      {
        id: '4-1',
        stageId: 'interface-interaction',
        stageName: 'Interface & Interaction',
        category: 'Design System',
        item: 'Design System Selected',
        status: interfaceData.selectedDesignSystem ? 'complete' : 'missing',
        priority: 'medium',
        description: 'UI component library chosen'
      },
      {
        id: '4-2',
        stageId: 'interface-interaction',
        stageName: 'Interface & Interaction',
        category: 'Interactions',
        item: 'Interaction Rules Defined',
        status: Array.isArray(interfaceData.interactionRules) && interfaceData.interactionRules.length > 0 ? 'complete' : 'missing',
        priority: 'medium',
        description: 'Component behaviors and animations'
      }
    );

    // Stage 5: Architecture Design
    const architectureData = stageData['architecture-design'] || {};
    items.push(
      {
        id: '5-1',
        stageId: 'architecture-design',
        stageName: 'Architecture Design',
        category: 'Technical',
        item: 'Database Schema',
        status: Array.isArray(architectureData.databaseSchema) && architectureData.databaseSchema.length > 0 ? 'complete' : 'missing',
        priority: 'high',
        description: 'Complete database structure defined'
      },
      {
        id: '5-2',
        stageId: 'architecture-design',
        stageName: 'Architecture Design',
        category: 'Technical',
        item: 'API Endpoints',
        status: Array.isArray(architectureData.apiEndpoints) && architectureData.apiEndpoints.length > 0 ? 'complete' : 'missing',
        priority: 'high',
        description: 'All required API routes planned'
      }
    );

    // Stage 6: User & Auth Flow
    const authData = stageData['user-auth-flow'] || {};
    items.push(
      {
        id: '6-1',
        stageId: 'user-auth-flow',
        stageName: 'User & Auth Flow',
        category: 'Security',
        item: 'Authentication Methods',
        status: Array.isArray(authData.authMethods) && 
                authData.authMethods.some((m: any) => m.enabled) 
                ? 'complete' : 'missing',
        priority: 'high',
        description: 'User login/signup methods defined'
      },
      {
        id: '6-2',
        stageId: 'user-auth-flow',
        stageName: 'User & Auth Flow',
        category: 'Security',
        item: 'User Roles & Permissions',
        status: Array.isArray(authData.userRoles) && authData.userRoles.length > 0 ? 'complete' : 'missing',
        priority: 'high',
        description: 'Role-based access control defined'
      }
    );
  } catch (error) {
    console.error('Error in performCompletionScan:', error);
  }

  return items;
}

/**
 * Generate AI feedback based on project data
 */
export function generateAIFeedback(stageData: StageData): AIFeedback[] {
  const feedback: AIFeedback[] = [];
  
  try {
    const ideationData = stageData['ideation-discovery'] || {};
    const featureData = stageData['feature-planning'] || {};
    const authData = stageData['user-auth-flow'] || {};

    // Suggestions based on current data
    if (ideationData.appIdea && !ideationData.competitors) {
      feedback.push({
        id: 'ai-1',
        type: 'suggestion',
        category: 'Market Research',
        title: 'Consider Adding Competitor Analysis',
        description: 'Adding competitor research could help differentiate your app and identify market gaps.',
        actionable: true,
        stageId: 'ideation-discovery'
      });
    }

    // Check if social features are selected but no moderator role exists
    const hasSocialFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                             featureData.selectedFeaturePacks.includes('social');
    
    const hasModeratorRole = Array.isArray(authData.userRoles) && 
                            authData.userRoles.some((r: any) => 
                              r.name?.toLowerCase().includes('moderator') || 
                              r.description?.toLowerCase().includes('moderation'));
    
    if (hasSocialFeatures && !hasModeratorRole) {
      feedback.push({
        id: 'ai-2',
        type: 'warning',
        category: 'Security',
        title: 'Social Features Need Moderation',
        description: 'Apps with social features typically need content moderation roles and policies.',
        actionable: true,
        stageId: 'user-auth-flow'
      });
    }

    // Check if commerce features are selected but auth features are not
    const hasCommerceFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                               featureData.selectedFeaturePacks.includes('commerce');
    
    const hasAuthFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                           featureData.selectedFeaturePacks.includes('auth');
    
    if (hasCommerceFeatures && !hasAuthFeatures) {
      feedback.push({
        id: 'ai-3',
        type: 'warning',
        category: 'Dependencies',
        title: 'E-commerce Requires Authentication',
        description: 'Payment processing features require user authentication for security and compliance.',
        actionable: true,
        stageId: 'feature-planning'
      });
    }

    // Enhancement suggestions
    feedback.push({
      id: 'ai-4',
      type: 'enhancement',
      category: 'User Experience',
      title: 'Consider Progressive Web App Features',
      description: 'Adding PWA capabilities could improve user engagement with offline support and push notifications.',
      actionable: false
    });

    // Mobile-first design recommendation if target users include mobile
    const targetUsersMentionMobile = typeof ideationData.targetUsers === 'string' && 
                                    ideationData.targetUsers.toLowerCase().includes('mobile');
    
    const platformIsMobile = ideationData.platform === 'mobile';
    
    if (targetUsersMentionMobile || platformIsMobile) {
      feedback.push({
        id: 'ai-5',
        type: 'suggestion',
        category: 'Performance',
        title: 'Mobile-First Design Recommended',
        description: 'Your target users prefer mobile. Consider mobile-first responsive design approach.',
        actionable: true,
        stageId: 'interface-interaction'
      });
    }
  } catch (error) {
    console.error('Error in generateAIFeedback:', error);
  }

  return feedback;
}

/**
 * Generate user test scenarios based on project data
 */
export function generateUserTestScenarios(stageData: StageData): UserTestScenario[] {
  const scenarios: UserTestScenario[] = [];
  
  try {
    const ideationData = stageData['ideation-discovery'] || {};
    const featureData = stageData['feature-planning'] || {};
    
    // Default scenarios
    scenarios.push(
      {
        id: 'test-1',
        persona: 'First-time User',
        scenario: 'New user discovers and tries the app for the first time',
        steps: [
          'Land on homepage/app store',
          'Read app description and value proposition',
          'Sign up for account',
          'Complete onboarding flow',
          'Explore main features',
          'Complete first meaningful action'
        ],
        expectedOutcome: 'User understands app value and successfully completes core action',
        frictionPoints: ['Unclear value proposition', 'Complex signup', 'Overwhelming interface'],
        status: 'not-started'
      },
      {
        id: 'test-2',
        persona: 'Returning User',
        scenario: 'Existing user returns to complete a task',
        steps: [
          'Open app/website',
          'Log in (if needed)',
          'Navigate to desired feature',
          'Complete intended task',
          'Review results/feedback'
        ],
        expectedOutcome: 'User efficiently completes task without confusion',
        frictionPoints: ['Forgotten password', 'Changed navigation', 'Feature not found'],
        status: 'not-started'
      }
    );

    // Add scenario based on features
    const hasSocialFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                             featureData.selectedFeaturePacks.includes('social');
    
    if (hasSocialFeatures) {
      scenarios.push({
        id: 'test-3',
        persona: 'Social User',
        scenario: 'User wants to interact with community features',
        steps: [
          'Find community/social section',
          'Browse content from other users',
          'Create own content/post',
          'Interact with others (like, comment, share)',
          'Manage privacy settings'
        ],
        expectedOutcome: 'User feels engaged and part of community',
        frictionPoints: ['Hard to find social features', 'Unclear privacy controls', 'Poor content discovery'],
        status: 'not-started'
      });
    }
    
    // Add scenario for commerce features if present
    const hasCommerceFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                               featureData.selectedFeaturePacks.includes('commerce');
    
    if (hasCommerceFeatures) {
      scenarios.push({
        id: 'test-4',
        persona: 'Customer',
        scenario: 'User completes a purchase flow',
        steps: [
          'Browse products/services',
          'Add items to cart',
          'Proceed to checkout',
          'Enter payment information',
          'Complete purchase',
          'View order confirmation'
        ],
        expectedOutcome: 'User successfully completes purchase with confidence',
        frictionPoints: ['Complex checkout process', 'Hidden fees', 'Payment errors', 'Lack of order confirmation'],
        status: 'not-started'
      });
    }
  } catch (error) {
    console.error('Error in generateUserTestScenarios:', error);
  }

  return scenarios;
}

/**
 * Calculate scores for each stage based on completion items
 */
function calculateStageScores(
  stages: Stage[],
  completionItems: CompletionItem[]
): Record<string, number> {
  const stageScores: Record<string, number> = {};
  
  try {
    // Group completion items by stage
    const stageItems: Record<string, CompletionItem[]> = {};
    
    completionItems.forEach(item => {
      if (!stageItems[item.stageId]) {
        stageItems[item.stageId] = [];
      }
      stageItems[item.stageId].push(item);
    });
    
    // Calculate score for each stage
    stages.forEach(stage => {
      const items = stageItems[stage.id] || [];
      if (items.length === 0) {
        stageScores[stage.id] = 0;
        return;
      }
      
      const completeItems = items.filter(item => item.status === 'complete').length;
      const partialItems = items.filter(item => item.status === 'partial').length;
      const score = Math.round(((completeItems + partialItems * 0.5) / items.length) * 100);
      
      stageScores[stage.id] = score;
    });
  } catch (error) {
    console.error('Error in calculateStageScores:', error);
  }
  
  return stageScores;
}

/**
 * Generate missing items based on completion items
 */
function generateMissingItems(completionItems: CompletionItem[]): Array<{
  stage: string;
  item: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}> {
  const missingItems: Array<{
    stage: string;
    item: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }> = [];
  
  try {
    // Filter for missing and partial items
    const incompleteItems = completionItems.filter(
      item => item.status === 'missing' || item.status === 'partial'
    );
    
    // Convert to missing items format
    incompleteItems.forEach(item => {
      missingItems.push({
        stage: item.stageId,
        item: item.item,
        priority: item.priority,
        impact: item.description
      });
    });
  } catch (error) {
    console.error('Error in generateMissingItems:', error);
  }
  
  return missingItems;
}

/**
 * Generate inconsistencies based on stage data
 */
function generateInconsistencies(stageData: StageData): Array<{
  description: string;
  stages: string[];
  recommendation: string;
}> {
  const inconsistencies: Array<{
    description: string;
    stages: string[];
    recommendation: string;
  }> = [];
  
  try {
    const featureData = stageData['feature-planning'] || {};
    const authData = stageData['user-auth-flow'] || {};
    const structureData = stageData['structure-flow'] || {};
    
    // Check for social features without moderation roles
    const hasSocialFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                             featureData.selectedFeaturePacks.includes('social');
    
    const hasModeratorRole = Array.isArray(authData.userRoles) && 
                            authData.userRoles.some((r: any) => 
                              r.name?.toLowerCase().includes('moderator') || 
                              r.description?.toLowerCase().includes('moderation'));
    
    if (hasSocialFeatures && !hasModeratorRole) {
      inconsistencies.push({
        description: 'Social features selected but no user roles for moderation',
        stages: ['feature-planning', 'user-auth-flow'],
        recommendation: 'Add moderator role or remove social features'
      });
    }
    
    // Check for commerce features without payment-related screens
    const hasCommerceFeatures = Array.isArray(featureData.selectedFeaturePacks) && 
                               featureData.selectedFeaturePacks.includes('commerce');
    
    const hasPaymentScreens = Array.isArray(structureData.screens) && 
                             structureData.screens.some((s: any) => 
                               s.name?.toLowerCase().includes('payment') || 
                               s.name?.toLowerCase().includes('checkout') || 
                               s.description?.toLowerCase().includes('payment'));
    
    if (hasCommerceFeatures && !hasPaymentScreens) {
      inconsistencies.push({
        description: 'E-commerce features selected but no payment/checkout screens defined',
        stages: ['feature-planning', 'structure-flow'],
        recommendation: 'Add payment and checkout screens to support e-commerce features'
      });
    }
  } catch (error) {
    console.error('Error in generateInconsistencies:', error);
  }
  
  return inconsistencies;
}

/**
 * Generate recommendations based on project data
 */
function generateRecommendations(
  stageData: StageData,
  completionItems: CompletionItem[],
  aiFeedback: AIFeedback[]
): Array<{
  type: 'improvement' | 'fix' | 'enhancement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}> {
  const recommendations: Array<{
    type: 'improvement' | 'fix' | 'enhancement';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }> = [];
  
  try {
    // Convert high-priority missing items to fix recommendations
    const highPriorityMissing = completionItems.filter(
      item => item.status === 'missing' && item.priority === 'high'
    );
    
    highPriorityMissing.forEach(item => {
      recommendations.push({
        type: 'fix',
        title: `Add ${item.item}`,
        description: `Missing ${item.item} in ${item.stageName}`,
        priority: 'high',
        effort: 'medium'
      });
    });
    
    // Convert actionable AI feedback to recommendations
    const actionableFeedback = aiFeedback.filter(feedback => feedback.actionable);
    
    actionableFeedback.forEach(feedback => {
      recommendations.push({
        type: feedback.type === 'warning' ? 'fix' : 
              feedback.type === 'enhancement' ? 'enhancement' : 'improvement',
        title: feedback.title,
        description: feedback.description,
        priority: feedback.type === 'warning' ? 'high' : 'medium',
        effort: 'medium'
      });
    });
    
    // Add standard recommendations based on project type
    const ideationData = stageData['ideation-discovery'] || {};
    const structureData = stageData['structure-flow'] || {};
    
    // Recommend onboarding flow if not present
    const hasOnboarding = structureData.includeOnboarding === true || 
                         (Array.isArray(structureData.userFlows) && 
                          structureData.userFlows.some((f: any) => 
                            f.name?.toLowerCase().includes('onboarding') || 
                            f.description?.toLowerCase().includes('onboarding')));
    
    if (!hasOnboarding) {
      recommendations.push({
        type: 'enhancement',
        title: 'Add User Onboarding Flow',
        description: 'Current structure lacks new user guidance',
        priority: 'medium',
        effort: 'medium'
      });
    }
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
  }
  
  return recommendations;
}

/**
 * Generate readiness assessment based on project data
 */
function generateReadinessAssessment(
  overallProgress: number,
  completionItems: CompletionItem[],
  aiFeedback: AIFeedback[]
): {
  readyForDevelopment: boolean;
  blockers: string[];
  nextSteps: string[];
} {
  const blockers: string[] = [];
  const nextSteps: string[] = [];
  
  try {
    // Check for high-priority missing items
    const highPriorityMissing = completionItems.filter(
      item => item.status === 'missing' && item.priority === 'high'
    );
    
    highPriorityMissing.forEach(item => {
      blockers.push(`Missing ${item.item} in ${item.stageName}`);
    });
    
    // Check for warnings in AI feedback
    const warnings = aiFeedback.filter(feedback => feedback.type === 'warning');
    
    warnings.forEach(warning => {
      blockers.push(warning.title);
    });
    
    // Generate next steps
    if (highPriorityMissing.length > 0) {
      nextSteps.push('Complete missing high-priority items');
    }
    
    if (warnings.length > 0) {
      nextSteps.push('Address AI feedback warnings');
    }
    
    if (overallProgress < 80) {
      nextSteps.push('Improve overall completion score to at least 80%');
    }
    
    if (nextSteps.length === 0) {
      nextSteps.push('Ready for export and development');
    }
  } catch (error) {
    console.error('Error in generateReadinessAssessment:', error);
    blockers.push('Error generating readiness assessment');
    nextSteps.push('Review project data for errors');
  }
  
  return {
    readyForDevelopment: overallProgress >= 80 && blockers.length === 0,
    blockers,
    nextSteps
  };
}