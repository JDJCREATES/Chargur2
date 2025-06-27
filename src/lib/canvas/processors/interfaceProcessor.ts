/**
 * interfaceProcessor.ts
 * 
 * Processes interface and interaction stage data into canvas nodes.
 * Handles the creation and updating of nodes related to design systems,
 * branding, and layout components.
 */

import { CanvasNodeData } from '../../../components/canvas/CanvasNode';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

/**
 * Process interface and interaction stage data
 */
export function processInterfaceData(
  currentNodes: CanvasNodeData[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): CanvasNodeData[] {
  const interfaceData = stageSpecificData || {};
  const lastInterfaceData = lastProcessedData['interface-interaction'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  
  if (!interfaceData || JSON.stringify(interfaceData) === JSON.stringify(lastInterfaceData)) {
    return nodes;
  }

  let uiX = 100;
  let uiY = 1000;

  // Remove old interface nodes
  nodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'interface-interaction');

  // Process design system
  if (interfaceData.selectedDesignSystem) {
    nodes.push(nodeFactory.createDesignSystemNode(interfaceData.selectedDesignSystem, uiX, uiY, nodes));
  }

  // Process custom branding
  if (interfaceData.customBranding) {
    nodes.push(nodeFactory.createBrandingNode(interfaceData.customBranding, uiX, uiY, nodes));
  }

  // Process layout blocks
  if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
    nodes.push(nodeFactory.createLayoutNode(interfaceData.layoutBlocks, uiX, uiY, nodes));
  }

  console.log('Processed interface data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}