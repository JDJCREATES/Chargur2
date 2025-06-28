/**
 * featureProcessor.ts
 * 
 * Processes feature planning stage data into canvas nodes.
 * Handles the creation and updating of nodes related to features,
 * feature packs, and custom features.
 */

import { CanvasNodeData } from '../../../components/canvas/CanvasNode';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';
import { v4 as uuidv4 } from 'uuid';

/**
 * Process feature planning stage data
 */
export function processFeatureData(
  currentNodes: CanvasNodeData[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): CanvasNodeData[] {
  const featureData = stageSpecificData;
  const lastFeatureData = lastProcessedData['feature-planning'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  
  if (!featureData || JSON.stringify(featureData) === JSON.stringify(lastFeatureData)) {
    return nodes;
  }

  let featureX = 100;
  let featureY = 350;

  // Get existing feature planning nodes
  const existingFeaturePlanningNodes = nodes.filter(node => 
    node.metadata?.stage === 'feature-planning');
  
  // Get non-feature planning nodes
  const nonFeaturePlanningNodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'feature-planning');
  
  // Create a new array for updated feature planning nodes
  const updatedFeaturePlanningNodes: CanvasNodeData[] = [];

  // Process selected feature packs
  if (featureData.selectedFeaturePacks) {
    featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
      // Check if this feature pack already exists
      const existingNode = existingFeaturePlanningNodes.find(node => 
        node.metadata?.pack === pack && node.type === 'feature');
      
      if (existingNode) {
        // Keep the existing node
        updatedFeaturePlanningNodes.push(existingNode);
        
        // Check if this feature has subFeatures that need a breakdown node
        if (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics') {
          // These feature packs typically have subfeatures
          const breakdownSteps = getDefaultSubFeatures(pack);
          
          // Check if a breakdown node already exists for this feature
          const existingBreakdownNode = existingFeaturePlanningNodes.find(node => 
            node.type === 'feature-breakdown' && 
            node.metadata?.parentFeatureId === existingNode.metadata?.sourceId);
          
          if (!existingBreakdownNode && breakdownSteps.length > 0) {
            // Create a new breakdown node
            const newBreakdownNode = nodeFactory.createFeatureBreakdownNode(
              existingNode.id,
              existingNode.title,
              breakdownSteps,
              [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]
            );
            updatedFeaturePlanningNodes.push(newBreakdownNode);
          }
        }
      } else {
        // Create a new node
        const newNode = nodeFactory.createFeaturePackNode(pack, index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
        updatedFeaturePlanningNodes.push(newNode);
        
        // Check if this feature pack should have a breakdown node
        if (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics') {
          // These feature packs typically have subfeatures
          const breakdownSteps = getDefaultSubFeatures(pack);
          
          if (breakdownSteps.length > 0) {
            // Create a new breakdown node
            const newBreakdownNode = nodeFactory.createFeatureBreakdownNode(
              newNode.id,
              newNode.title,
              breakdownSteps,
              [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]
            );
            updatedFeaturePlanningNodes.push(newBreakdownNode);
          }
        }
      }
    });
  }

  // Process custom features
  if (featureData.customFeatures) {
    const startIndex = featureData.selectedFeaturePacks?.length || 0;
    featureData.customFeatures.forEach((feature: any, index: number) => {
      // Check if this custom feature already exists by ID
      const existingNode = existingFeaturePlanningNodes.find(node => 
        node.metadata?.custom === true && 
        node.metadata?.sourceId === feature.id);
      
      if (existingNode) {
        // Keep the existing node, but update its content if needed
        const updatedNode = {
          ...existingNode,
          title: feature.name,
          content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`
        };
        updatedFeaturePlanningNodes.push(updatedNode);
        
        // Check if this feature has subFeatures that need a breakdown node
        if (feature.subFeatures && Array.isArray(feature.subFeatures) && feature.subFeatures.length > 0) {
          // Check if a breakdown node already exists for this feature
          const existingBreakdownNode = existingFeaturePlanningNodes.find(node => 
            node.type === 'feature-breakdown' && 
            node.metadata?.parentFeatureId === existingNode.id);
          
          if (existingBreakdownNode) {
            // Update existing breakdown node
            const updatedBreakdownNode = {
              ...existingBreakdownNode,
              breakdownSteps: feature.subFeatures
            };
            updatedFeaturePlanningNodes.push(updatedBreakdownNode);
          } else {
            // Create a new breakdown node
            const newBreakdownNode = nodeFactory.createFeatureBreakdownNode(
              existingNode.id,
              feature.name,
              feature.subFeatures,
              [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]
            );
            updatedFeaturePlanningNodes.push(newBreakdownNode);
          }
        }
      } else {
        // Create a new node
        const newNode = nodeFactory.createCustomFeatureNode(feature, startIndex + index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
        updatedFeaturePlanningNodes.push(newNode);
        
        // Check if this feature has subFeatures that need a breakdown node
        if (feature.subFeatures && Array.isArray(feature.subFeatures) && feature.subFeatures.length > 0) {
          // Create a new breakdown node
          const newBreakdownNode = nodeFactory.createFeatureBreakdownNode(
            newNode.id,
            feature.name,
            feature.subFeatures,
            [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]
          );
          updatedFeaturePlanningNodes.push(newBreakdownNode);
        }
      }
    });
  }

  // Add natural language features if provided
  if (featureData.naturalLanguageFeatures) {
    // Check if natural language feature node already exists
    const existingNLNode = existingFeaturePlanningNodes.find(node => 
      node.metadata?.type === 'description');
    
    if (existingNLNode) {
      // Update the existing node
      const updatedNode = {
        ...existingNLNode,
        content: featureData.naturalLanguageFeatures
      };
      updatedFeaturePlanningNodes.push(updatedNode);
    } else {
      // Create a new node
      const newNode = nodeFactory.createNaturalLanguageFeatureNode(
        featureData.naturalLanguageFeatures, 
        [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]
      );
      updatedFeaturePlanningNodes.push(newNode);
    }
  }

  // Combine non-feature planning nodes with updated feature planning nodes
  nodes = [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes];

  console.log('Processed feature data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}

/**
 * Get default sub-features for common feature packs
 */
function getDefaultSubFeatures(featurePack: string): string[] {
  switch (featurePack) {
    case 'auth':
      return [
        'User registration with email/password',
        'Login/logout functionality',
        'Password reset flow',
        'User profile management',
        'Role-based access control'
      ];
    case 'social':
      return [
        'User profiles and connections',
        'Content sharing capabilities',
        'Like/reaction system',
        'Comment functionality',
        'Activity feed'
      ];
    case 'commerce':
      return [
        'Product catalog and browsing',
        'Shopping cart functionality',
        'Checkout process',
        'Payment processing',
        'Order management'
      ];
    case 'analytics':
      return [
        'User activity tracking',
        'Performance metrics dashboard',
        'Custom report generation',
        'Data visualization',
        'Export capabilities'
      ];
    case 'media':
      return [
        'File upload and storage',
        'Media playback controls',
        'Gallery/library management',
        'Media organization (folders/tags)',
        'Sharing capabilities'
      ];
    case 'communication':
      return [
        'Direct messaging',
        'Group chat functionality',
        'Notification system',
        'Message status tracking',
        'Media sharing in messages'
      ];
    default:
      return [];
  }
}