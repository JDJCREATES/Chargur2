/**
 * structureProcessor.ts
 * 
 * Processes structure and flow stage data into canvas nodes.
 * Handles the creation and updating of nodes related to screens,
 * user flows, and navigation patterns.
 */

import { Node } from 'reactflow';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

/**
 * Process structure and flow stage data
 */
export function processStructureData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
  const structureData = stageSpecificData;
  const lastStructureData = lastProcessedData['structure-flow'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  
  if (!structureData || JSON.stringify(structureData) === JSON.stringify(lastStructureData)) {
    return nodes;
  }

  let flowX = 100;
  let flowY = 600;

  // Remove old structure nodes
  nodes = nodes.filter(node => 
    !node.data?.metadata?.stage || node.data.metadata.stage !== 'structure-flow');

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