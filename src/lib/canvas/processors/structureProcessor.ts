/**
 * structureProcessor.ts
 * 
 * Processes structure and flow stage data into canvas nodes.
 * Handles the creation and updating of nodes related to screens,
 * user flows, and navigation patterns.
 */

import { Node } from 'reactflow';
import * as nodeFactory from '../nodeFactory';

/**
 * Convert file structure object to string representation
 */
function fileStructureToString(structure: any, indent: number = 0): string {
  if (!structure) return '';
  
  let result = '';
  const indentStr = ' '.repeat(indent);
  
  Object.entries(structure).forEach(([key, value]) => {
    result += `${indentStr}${key}\n`;
    
    if (Array.isArray(value)) {
      // Files
      value.forEach((file: string) => {
        result += `${indentStr}  ${file}\n`;
      });
    } else if (typeof value === 'object') {
      // Subdirectories
      result += fileStructureToString(value, indent + 2);
    }
  });
  
  return result;
}

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
  
  // Track if we've processed the special nodes
  let processedInfoArchNode = false;
  let processedUserJourneyNode = false;
  let processedStateDataFlowNode = false;
  let processedFileStructureNode = false;
  
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

  // Process user journey (all user flows together)
  if (structureData.userFlows) {
    const userFlows = structureData.userFlows || [];
    
    // Check if user journey node already exists
    const existingNode = existingStructureNodes.find(node => 
      node.type === 'userJourney'
    );
    
    if (existingNode) {
      processedUserJourneyNode = true;
      
      // Check if user flows have changed
      const hasChanged = !areArraysEqual(existingNode.data?.userFlows, userFlows);
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            userFlows,
            content: `User journey map with ${userFlows.length} flows.`
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
      const newNode = nodeFactory.createUserJourneyNode(userFlows, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process state data flow
  if (structureData.stateManagement || structureData.dataFlow) {
    const stateManagement = structureData.stateManagement || '';
    const dataFlow = structureData.dataFlow || '';
    
    // Check if state data flow node already exists
    const existingNode = existingStructureNodes.find(node => 
      node.type === 'stateDataFlow'
    );
    
    if (existingNode) {
      processedStateDataFlowNode = true;
      
      // Check if state management or data flow have changed
      const hasChanged = 
        existingNode.data?.stateManagement !== stateManagement ||
        existingNode.data?.dataFlow !== dataFlow;
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            stateManagement,
            dataFlow,
            content: `State management: ${stateManagement}\nData flow: ${dataFlow}`
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
      const newNode = nodeFactory.createStateDataFlowNode(stateManagement, dataFlow, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process file structure
  if (structureData.fileStructure && Object.keys(structureData.fileStructure).length > 0) {
    const fileStructureString = fileStructureToString(structureData.fileStructure);
    
    // Check if file structure node already exists
    const existingNode = existingStructureNodes.find(node => 
      node.type === 'markdownCode' && node.data?.title === 'Project File Structure'
    );
    
    if (existingNode) {
      processedFileStructureNode = true;
      
      // Check if file structure has changed
      if (existingNode.data?.content !== fileStructureString) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: fileStructureString
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
      const newNode = nodeFactory.createMarkdownCodeNode(
        fileStructureString,
        'Project File Structure',
        'Structure & Flow',
        newNodes
      );
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Add any remaining structure nodes that weren't processed
  existingStructureNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.type === 'informationArchitecture' && processedInfoArchNode) ||
        (node.type === 'userJourney' && processedUserJourneyNode) ||
        (node.type === 'stateDataFlow' && processedStateDataFlowNode) ||
        (node.type === 'markdownCode' && node.data?.title === 'Project File Structure' && processedFileStructureNode)) {
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