/**
 * architectureProcessor.ts
 * 
 * Processes architecture design stage data into canvas nodes.
 * Handles the creation and updating of nodes related to database schema,
 * API endpoints, and system architecture.
 */

import { CanvasNodeData } from '../../../components/canvas/CanvasNode';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

/**
 * Process architecture design stage data
 */
export function processArchitectureData(
  stageData: any, 
  currentState: ProcessorState, 
  nodes: CanvasNodeData[]
): CanvasNodeData[] {
  const architectureData = stageData['architecture-design'];
  const lastArchitectureData = (currentState.lastProcessedData || {})['architecture-design'] || {};
  const originalNodeCount = nodes.length;
  
  if (!architectureData || JSON.stringify(architectureData) === JSON.stringify(lastArchitectureData)) {
    return nodes;
  }

  let systemX = 100;
  let systemY = 800;

  // Remove old architecture nodes
  nodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'architecture-design');

  // Process database schema
  if (architectureData.databaseSchema) {
    architectureData.databaseSchema.forEach((table: any, index: number) => {
      nodes.push(nodeFactory.createDatabaseTableNode(table, index, systemX, systemY, nodes));
    });
  }

  // Process API endpoints
  if (architectureData.apiEndpoints) {
    nodes.push(nodeFactory.createAPIEndpointsNode(architectureData.apiEndpoints, systemX, systemY, nodes));
  }

  // Process other architecture components
  if (architectureData.sitemap) {
    architectureData.sitemap.forEach((route: any, index: number) => {
      nodes.push(nodeFactory.createRouteNode(route, index, systemX, systemY, nodes));
    });
  }

  console.log('Processed architecture data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}