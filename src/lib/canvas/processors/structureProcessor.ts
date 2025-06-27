/**
 * structureProcessor.ts
 * 
 * Processes structure and flow stage data into canvas nodes.
 * Handles the creation and updating of nodes related to screens,
 * user flows, and navigation patterns.
 */

import { CanvasNodeData } from '../../../components/canvas/CanvasNode';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

/**
 * Process structure and flow stage data
 */
export function processStructureData(
  stageData: any, 
  currentState: ProcessorState, 
  nodes: CanvasNodeData[]
): CanvasNodeData[] {
  const structureData = stageData['structure-flow'];
  const lastStructureData = (currentState.lastProcessedData || {})['structure-flow'] || {};
  const originalNodeCount = nodes.length;
  
  if (!structureData || JSON.stringify(structureData) === JSON.stringify(lastStructureData)) {
    return nodes;
  }

  let flowX = 100;
  let flowY = 600;

  // Remove old structure nodes
  nodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'structure-flow');

  // Process screens
  if (structureData.screens) {
    structureData.screens.forEach((screen: any, index: number) => {
      nodes.push(nodeFactory.createScreenNode(screen, index, flowX, flowY, nodes));
    });
  }

  // Process user flows
  if (structureData.userFlows) {
    structureData.userFlows.forEach((flow: any, index: number) => {
      nodes.push(nodeFactory.createUserFlowNode(flow, index, flowX, flowY, nodes));
    });
  }

  console.log('Processed structure data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}