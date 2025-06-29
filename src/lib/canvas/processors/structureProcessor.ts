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
import { STAGE3_NODE_TYPES } from '../nodeFactory';

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
  let nodesChanged = false;
  
  if (!structureData || JSON.stringify(structureData) === JSON.stringify(lastStructureData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  
  // Separate structure flow nodes from other nodes
  const existingStructureNodes: Node[] = [];
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'structure-flow') {
      existingStructureNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-structure nodes
  let newNodes = [...otherNodes];

  let flowX = 100;
  let flowY = 600;
  
  // Track if we've processed the information architecture node
  let processedInfoArchNode = false;
  
  // Process information architecture (screens and data models together)
  if (structureData.screens || structureData.dataModels) {
    const screens = structureData.screens || [];
    const dataModels = structureData.dataModels || [];
    
    // Check if information architecture node already exists
    const existingNode = existingStructureNodes.find(node => 
      node.type === 'informationArchitecture'
    );
    
    if (existingNode) {
      processedInfoArchNode = true;
      
      // Check if screens or data models have changed
      const hasChanged = 
        !areArraysEqual(existingNode.data?.screens, screens) ||
        !areArraysEqual(existingNode.data?.dataModels, dataModels);
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            screens,
            dataModels,
            content: `Information architecture with ${screens.length} screens and ${dataModels.length} data models.`
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingNode);
      }
    } else {
      // Create a new node
      const newNode = nodeFactory.createInformationArchitectureNode(screens, dataModels, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }


  // Track which user flow nodes we've processed
  const processedFlowIds = new Set<string>();

  // Process user flows
  if (structureData.userFlows) {
    const existingFlowNodes = existingStructureNodes.filter(node => 
      node.data?.metadata?.flowType === 'user-journey'
    );
    
    structureData.userFlows.forEach((flow: any, index: number) => {
      // Check if this flow already exists
      const existingNode = existingFlowNodes.find(node => 
        node.data?.metadata?.sourceId === flow.id
      );
      
      if (existingNode) {
        // Check if flow data has changed
        const hasChanged = 
          existingNode.data?.title !== flow.name ||
          !areArraysEqual(flow.steps, existingNode.data?.content.match(/→\s*([^→\n]+)/g)?.map((s: string) => s.replace(/→\s*/, '').trim()));
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              title: flow.name,
              content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`
            }
          };
          newNodes.push(updatedNode);
          nodesChanged = true;
        } else {
          // Keep existing node unchanged
          newNodes.push(existingNode);
        }
        
        processedFlowIds.add(existingNode.id);
      } else {
        // Create a new node
        const newNode = nodeFactory.createUserFlowNode(flow, index, flowX, flowY, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Add any remaining structure nodes that weren't processed
  existingStructureNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.type === 'informationArchitecture' && processedInfoArchNode) ||
        (node.data?.metadata?.flowType === 'user-journey' && processedFlowIds.has(node.id))) {
      return;
    }
    
    // Add the node to our new nodes array
    newNodes.push(node);
  });

  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed structure data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
}