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
import { v4 as uuidv4 } from 'uuid';

import { STAGE2_NODE_TYPES, STAGE2_NODE_DEFAULTS } from '../nodeFactory';
import { getSmartNodePosition } from '../nodePlacementUtils';

// Helper function to check if arrays are equal
function areArraysEqual(arr1: any[] | undefined, arr2: any[] | undefined): boolean {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  
  // For simple arrays of primitives
  if (arr1.every(item => typeof item !== 'object')) {
    return arr1.every((item, index) => item === arr2[index]);
  }
  
  // For arrays of objects, we'd need deeper comparison
  // This is a simplified version
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}


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
  let nodesChanged = false;
  
  if (!featureData || JSON.stringify(featureData) === JSON.stringify(lastFeatureData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  
  // Separate feature planning nodes from other nodes
  const existingFeaturePlanningNodes: Node[] = [];
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'feature-planning') {
      existingFeaturePlanningNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-feature planning nodes
  let newNodes = [...otherNodes];

  let featureX = 100;
  let featureY = 350;

  // Track which feature pack nodes we've processed
  const processedFeaturePackIds = new Set<string>();

  // Process selected feature packs
  if (featureData.selectedFeaturePacks) {
    featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
      // Check if this feature pack already exists
      const existingNode = existingFeaturePlanningNodes.find(node =>
        node.data?.metadata?.pack === pack && node.type === 'feature');
      
      if (existingNode) {
        // Keep the existing node
        const updatedNode = { ...existingNode };
        processedFeaturePackIds.add(existingNode.id);
        
        // Add default sub-features if none exist
        if ((!updatedNode.data.subFeatures || updatedNode.data.subFeatures.length === 0) && 
            (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics' || 
             pack === 'media' || pack === 'communication')) {
          updatedNode.data.subFeatures = getDefaultSubFeatures(pack);
           nodesChanged = true;
        }
        
        newNodes.push(updatedNode);
      } else {
        // Create a new node
        const newNode = nodeFactory.createFeaturePackNode(pack, index, featureX, featureY, newNodes);
        
        // Add default sub-features for common feature packs
        if (pack === 'auth' || pack === 'social' || pack === 'commerce' || pack === 'analytics' || 
            pack === 'media' || pack === 'communication') {
          newNode.data.subFeatures = getDefaultSubFeatures(pack);
        }
        
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Track which custom feature nodes we've processed
  const processedCustomFeatureIds = new Set<string>();

  // Process custom features
  if (featureData.customFeatures) {
    const startIndex = featureData.selectedFeaturePacks?.length || 0;
    featureData.customFeatures.forEach((feature: any, index: number) => {
      // Check if this custom feature already exists by ID
      const existingNode = existingFeaturePlanningNodes.find(node =>
        node.data?.metadata?.custom === true && 
        node.data?.metadata?.sourceId === feature.id);
      
      if (existingNode) {
        processedCustomFeatureIds.add(existingNode.id);
        
        // Check if any data has changed
        const hasChanged = 
          existingNode.data?.title !== feature.name ||
          existingNode.data?.content !== `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}` ||
          existingNode.data?.metadata?.priority !== (feature.priority || 'should') ||
          existingNode.data?.metadata?.complexity !== (feature.complexity || 'medium') ||
          existingNode.data?.metadata?.category !== (feature.category || 'both') ||
          !areArraysEqual(existingNode.data?.subFeatures, feature.subFeatures);
        
        // Keep the existing node, but update its content if needed
        if (hasChanged) {
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
        
          newNodes.push(updatedNode);
          nodesChanged = true;
        } else {
          // Keep existing node unchanged
          newNodes.push(existingNode);
        }
      } else {
        // Create a new node
        const newNode = nodeFactory.createCustomFeatureNode(feature, startIndex + index, featureX, featureY, newNodes);
        
        // Add sub-features if they exist in the feature data
        if (feature.subFeatures && Array.isArray(feature.subFeatures)) {
          newNode.data.subFeatures = feature.subFeatures;
        }
        
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Track if we've processed the natural language feature node
  let processedNLNode = false;

  // Add natural language features if provided
  if (featureData.naturalLanguageFeatures) {
    // Check if natural language feature node already exists
    const existingNLNode = existingFeaturePlanningNodes.find(node =>
      node.data?.metadata?.type === 'description');
    
    if (existingNLNode) {
      processedNLNode = true;
      
      // Update the existing node
      if (existingNLNode.data?.content !== featureData.naturalLanguageFeatures) {
        const updatedNode = {
          ...existingNLNode,
          data: {
            ...existingNLNode.data,
            content: featureData.naturalLanguageFeatures
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingNLNode);
      }
    } else {
      // Create a new node
      const newNode = nodeFactory.createNaturalLanguageFeatureNode(
        featureData.naturalLanguageFeatures, 
        newNodes
      );
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }
  
  // Track if we've processed the architecture node
  let processedArchNode = false;
  
  // Process architecture data if available
  if (featureData.architecturePrep && 
      (featureData.architecturePrep.screens?.length > 0 || 
       featureData.architecturePrep.apiRoutes?.length > 0 || 
       featureData.architecturePrep.components?.length > 0)) {
    
    // Check if architecture node already exists
    const existingArchNode = existingFeaturePlanningNodes.find(node =>
      node.type === 'architecture');
    
    if (existingArchNode) {
      processedArchNode = true;
      
      // Update existing node
      // Check if architecture data has changed
      if (JSON.stringify(existingArchNode.data?.metadata?.architectureData) !== 
          JSON.stringify(featureData.architecturePrep)) {
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
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingArchNode);
      }
    } else {
      // Create a new architecture node
      const newNode: Node = {
        id: uuidv4(),
        type: STAGE2_NODE_TYPES.ARCHITECTURE,
        position: getSmartNodePosition(
          newNodes,
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
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Add any remaining feature planning nodes that weren't processed
  existingFeaturePlanningNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.data?.metadata?.pack && processedFeaturePackIds.has(node.id)) ||
        (node.data?.metadata?.custom && processedCustomFeatureIds.has(node.id)) ||
        (node.data?.metadata?.type === 'description' && processedNLNode) ||
        (node.type === 'architecture' && processedArchNode)) {
      return;
    }
    
    // Add the node to our new nodes array
    newNodes.push(node);
  });

  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed feature data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
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