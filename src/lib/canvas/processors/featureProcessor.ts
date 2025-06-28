/**
 * featureProcessor.ts
 * 
 * Processes feature planning stage data into canvas nodes.
 * Handles the creation and updating of nodes related to features,
 * feature packs, and custom features.
 */

import { Node } from 'reactflow';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

// Define constants for node types
const STAGE2_NODE_TYPES = { 
  FEATURE: 'feature',
  ARCHITECTURE: 'architecture',
};

/**
 * Process feature planning stage data
 */
export function processFeatureData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
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
    node.data?.metadata?.stage === 'feature-planning');
  
  // Get non-feature planning nodes
  const nonFeaturePlanningNodes = nodes.filter(node => 
    !node.data?.metadata?.stage || node.data.metadata.stage !== 'feature-planning');
  
  // Create a new array for updated feature planning nodes
  const updatedFeaturePlanningNodes: CanvasNodeData[] = [];

  // Process selected feature packs
  if (featureData.selectedFeaturePacks) {
    featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
      // Check if this feature pack already exists
      const existingNode = existingFeaturePlanningNodes.find(node => 
        node.data?.metadata?.pack === pack && node.type === 'feature');
      
      if (existingNode) {
        // Keep the existing node
        const updatedNode = { ...existingNode };
        
        // Add default sub-features if none exist
        if ((!updatedNode.data.subFeatures || updatedNode.data.subFeatures.length === 0) && 
            (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics' || 
             pack === 'media' || pack === 'communication')) {
          updatedNode.data.subFeatures = getDefaultSubFeatures(pack);
        }
        
        updatedFeaturePlanningNodes.push(updatedNode);
      } else {
        // Create a new node
        const newNode = nodeFactory.createFeaturePackNode(pack, index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
        
        // Add default sub-features for common feature packs
        if (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics' || 
            pack === 'media' || pack === 'communication') {
          newNode.subFeatures = getDefaultSubFeatures(pack);
        }
        
        updatedFeaturePlanningNodes.push(newNode);
      }
    });
  }

  // Process custom features
  if (featureData.customFeatures) {
    const startIndex = featureData.selectedFeaturePacks?.length || 0;
    featureData.customFeatures.forEach((feature: any, index: number) => {
      // Check if this custom feature already exists by ID
      const existingNode = existingFeaturePlanningNodes.find(node => 
        node.data?.metadata?.custom === true && 
        node.data?.metadata?.sourceId === feature.id);
      
      if (existingNode) {
        // Keep the existing node, but update its content if needed
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            title: feature.name,
            content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
            metadata: {
              ...existingNode.data.metadata,
              priority: feature.priority || 'should',
              complexity: feature.complexity || 'medium',
              category: feature.category || 'both'
            }
          }
        };
        
        // Update sub-features if they exist in the feature data
        if (feature.subFeatures && Array.isArray(feature.subFeatures)) {
          updatedNode.data.subFeatures = feature.subFeatures;
        }
        
        updatedFeaturePlanningNodes.push(updatedNode);
      } else {
        // Create a new node
        const newNode = nodeFactory.createCustomFeatureNode(feature, startIndex + index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
        
        // Add sub-features if they exist in the feature data
        if (feature.subFeatures && Array.isArray(feature.subFeatures)) {
          newNode.data.subFeatures = feature.subFeatures;
        }
        
        updatedFeaturePlanningNodes.push(newNode);
      }
    });
  }

  // Add natural language features if provided
  if (featureData.naturalLanguageFeatures) {
    // Check if natural language feature node already exists
    const existingNLNode = existingFeaturePlanningNodes.find(node => 
      node.data?.metadata?.type === 'description');
    
    if (existingNLNode) {
      // Update the existing node
      const updatedNode = {
        ...existingNLNode,
        data: {
          ...existingNLNode.data,
          content: featureData.naturalLanguageFeatures
        }
      };
      updatedFeaturePlanningNodes.push(updatedNode);
    } else {
      // Create a new node
      const newNode = nodeFactory.createNaturalLanguageFeatureNode(
        featureData.naturalLanguageFeatures, 
        [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes as Node[]]
      );
      updatedFeaturePlanningNodes.push(newNode);
    }
  }
  
  // Process architecture data if available
  if (featureData.architecturePrep && 
      (featureData.architecturePrep.screens?.length > 0 || 
       featureData.architecturePrep.apiRoutes?.length > 0 || 
       featureData.architecturePrep.components?.length > 0)) {
    
    // Check if architecture node already exists
    const existingArchNode = existingFeaturePlanningNodes.find(node => 
      node.type === 'architecture');
    
    if (existingArchNode) {
      // Update existing node
      const updatedNode = {
        ...existingArchNode,
        data: {
          ...existingArchNode.data,
          metadata: {
            ...existingArchNode.data.metadata,
            architectureData: featureData.architecturePrep
          }
        }
      };
      updatedFeaturePlanningNodes.push(updatedNode);
    } else {
      // Create a new architecture node
      const newNode: CanvasNodeData = {
        id: uuidv4(),
        type: STAGE2_NODE_TYPES.ARCHITECTURE,
        title: 'Architecture Blueprint',
        content: `Architecture blueprint with ${featureData.architecturePrep.screens.length} screens, ${featureData.architecturePrep.apiRoutes.length} API routes, and ${featureData.architecturePrep.components.length} components.`,
        position: getSmartNodePosition(
          [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes],
          STAGE2_NODE_DEFAULTS.architecture.size,
          'feature',
          undefined,
          'feature-planning'),
        data: {
          title: 'Architecture Blueprint',
          content: `Architecture blueprint with ${featureData.architecturePrep.screens.length} screens, ${featureData.architecturePrep.apiRoutes.length} API routes, and ${featureData.architecturePrep.components.length} components.`,
          size: STAGE2_NODE_DEFAULTS.architecture.size,
          color: 'indigo',
          connections: [],
          metadata: { 
            stage: 'feature-planning',
            architectureData: featureData.architecturePrep
          },
          resizable: true
        }
      };
      
      updatedFeaturePlanningNodes.push(newNode);
    }
  }

  // Combine non-feature planning nodes with updated feature planning nodes
  nodes = [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes as Node[]];

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