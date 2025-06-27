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
  stageData: any, 
  currentState: ProcessorState, 
  nodes: CanvasNodeData[]
): CanvasNodeData[] {
  const featureData = stageData['feature-planning'];
  const lastFeatureData = (currentState.lastProcessedData || {})['feature-planning'] || {};
  const originalNodeCount = nodes.length;
  
  if (!featureData || JSON.stringify(featureData) === JSON.stringify(lastFeatureData)) {
    return nodes;
  }

  let featureX = 100;
  let featureY = 350;

  // Remove old feature nodes
  nodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'feature-planning');

  // Process selected feature packs
  if (featureData.selectedFeaturePacks) {
    featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
      nodes.push(nodeFactory.createFeaturePackNode(pack, index, featureX, featureY, nodes));
    });
  }

  // Process custom features
  if (featureData.customFeatures) {
    const startIndex = featureData.selectedFeaturePacks?.length || 0;
    featureData.customFeatures.forEach((feature: any, index: number) => {
      nodes.push(nodeFactory.createCustomFeatureNode(feature, startIndex + index, featureX, featureY, nodes));
    });
  }

  // Add natural language features if provided
  if (featureData.naturalLanguageFeatures) {
    nodes.push(nodeFactory.createNaturalLanguageFeatureNode(featureData.naturalLanguageFeatures, nodes));
  }

  console.log('Processed feature data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}