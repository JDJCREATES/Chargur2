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
      } else {
        // Create a new node
        const newNode = nodeFactory.createFeaturePackNode(pack, index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
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
        node.metadata?.custom === true && 
        node.metadata?.featureId === feature.id);
      
      if (existingNode) {
        // Keep the existing node, but update its content if needed
        const updatedNode = {
          ...existingNode,
          title: feature.name,
          content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`
        };
        updatedFeaturePlanningNodes.push(updatedNode);
      } else {
        // Create a new node
        const newNode = nodeFactory.createCustomFeatureNode(feature, startIndex + index, featureX, featureY, [...nonFeaturePlanningNodes, ...updatedFeaturePlanningNodes]);
        updatedFeaturePlanningNodes.push(newNode);
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