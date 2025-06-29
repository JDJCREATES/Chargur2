/**
 * ideationProcessor.ts
 * 
 * Processes ideation and discovery stage data into canvas nodes.
 * Handles the creation and updating of nodes related to app concept,
 * problem statement, user personas, etc.
 */

import { Node } from 'reactflow';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import { STAGE1_NODE_TYPES } from '../nodeFactory';
import * as nodeFactory from '../nodeFactory';

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
 * Process ideation and discovery stage data
 */
export function processIdeationData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
  const ideationData = stageSpecificData;
  const lastIdeationData = lastProcessedData['ideation-discovery'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  let nodesChanged = false;
  
  if (!ideationData || JSON.stringify(ideationData) === JSON.stringify(lastIdeationData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  const existingIdeationNodes: Node[] = [];
  
  // Separate ideation nodes from other nodes
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'ideation-discovery') {
      existingIdeationNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-ideation nodes
  let newNodes = [...otherNodes];

  // Only replace specific singleton nodes (like app name), not all ideation nodes
  const existingAppNameNode = existingNodesMap.get(STAGE1_NODE_TYPES.APP_NAME);
  const existingTaglineNode = existingNodesMap.get(STAGE1_NODE_TYPES.TAGLINE);
  const existingCoreProblemNode = existingNodesMap.get(STAGE1_NODE_TYPES.CORE_PROBLEM);
  const existingMissionNode = existingNodesMap.get(STAGE1_NODE_TYPES.MISSION);
  const existingValuePropNode = existingNodesMap.get(STAGE1_NODE_TYPES.VALUE_PROPOSITION);

  // Create or update singleton nodes (these should replace existing ones)
  if (ideationData.appName && (!existingAppNameNode || existingAppNameNode.data?.value !== ideationData.appName)) {
    if (existingAppNameNode) {
      // Update existing node
      const updatedNode = {
        ...existingAppNameNode,
        data: {
          ...existingAppNameNode.data,
          value: ideationData.appName,
          nameHistory: [...(existingAppNameNode.data?.nameHistory || []), existingAppNameNode.data?.value]
            .filter((name): name is string => name !== undefined && name !== null && name.trim() !== '')
        }
      };
      newNodes.push(updatedNode);
      nodesChanged = true;
    } else {
      // Create new node
      newNodes.push(nodeFactory.createAppNameNode(ideationData.appName, newNodes));
      nodesChanged = true;
    }
  } else if (existingAppNameNode) {
    // Keep existing node unchanged
    newNodes.push(existingAppNameNode);
  }

  if (ideationData.tagline && (!existingTaglineNode || existingTaglineNode.data?.value !== ideationData.tagline)) {
    if (existingTaglineNode) {
      // Update existing node
      const updatedNode = {
        ...existingTaglineNode,
        data: {
          ...existingTaglineNode.data,
          value: ideationData.tagline
        }
      };
      newNodes.push(updatedNode);
      nodesChanged = true;
    } else {
      // Create new node
      newNodes.push(nodeFactory.createTaglineNode(ideationData.tagline, newNodes));
      nodesChanged = true;
    }
  } else if (existingTaglineNode) {
    // Keep existing node unchanged
    newNodes.push(existingTaglineNode);
  }

  if (ideationData.problemStatement && (!existingCoreProblemNode || existingCoreProblemNode.data?.value !== ideationData.problemStatement)) {
    if (existingCoreProblemNode) {
      // Update existing node
      const updatedNode = {
        ...existingCoreProblemNode,
        data: {
          ...existingCoreProblemNode.data,
          value: ideationData.problemStatement
        }
      };
      newNodes.push(updatedNode);
      nodesChanged = true;
    } else {
      // Create new node
      newNodes.push(nodeFactory.createCoreProblemNode(ideationData.problemStatement, newNodes));
      nodesChanged = true;
    }
  } else if (existingCoreProblemNode) {
    // Keep existing node unchanged
    newNodes.push(existingCoreProblemNode);
  }

  if (ideationData.appIdea && (!existingMissionNode || existingMissionNode.data?.value !== ideationData.appIdea)) {
    if (existingMissionNode) {
      // Update existing node
      const updates: any = {};
      updates.value = ideationData.appIdea;

      // Add mission statement if available
      if (ideationData.missionStatement) {
        updates.missionStatement = ideationData.missionStatement;
      }
      
      const updatedNode = {
        ...existingMissionNode,
        data: {
          ...existingMissionNode.data,
          ...updates
        }
      };
      newNodes.push(updatedNode);
      nodesChanged = true;
    } else {
      // Create new node
      newNodes.push(nodeFactory.createMissionNode(ideationData.appIdea, ideationData.missionStatement, newNodes));
      nodesChanged = true;
    }
  } else if (existingMissionNode) {
    // Keep existing node unchanged
    newNodes.push(existingMissionNode);
  }

  if (ideationData.valueProposition && (!existingValuePropNode || existingValuePropNode.data?.value !== ideationData.valueProposition)) {
    if (existingValuePropNode) {
      // Update existing node
      const updatedNode = {
        ...existingValuePropNode,
        data: {
          ...existingValuePropNode.data,
          value: ideationData.valueProposition
        }
      };
      newNodes.push(updatedNode);
      nodesChanged = true;
    } else {
      // Create new node
      newNodes.push(nodeFactory.createValuePropNode(ideationData.valueProposition, newNodes));
      nodesChanged = true;
    }
  } else if (existingValuePropNode) {
    // Keep existing node unchanged
    newNodes.push(existingValuePropNode);
  }

  // For multi-instance nodes like user personas, only add new ones
  if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
    const existingPersonas = existingIdeationNodes.filter(node => 
      node.data?.metadata?.nodeType === 'userPersona'
    );
    
    // Track which existing personas we've processed
    const processedPersonaIds = new Set<string>();
  
    // Only add personas that don't already exist
    ideationData.userPersonas.forEach((persona: any, index: number) => {
      const personaExists = existingPersonas.some(existing => 
        existing.data?.name === persona.name && existing.data?.role === persona.role
      );
    
      if (!personaExists) {
        newNodes.push(nodeFactory.createUserPersonaNode(persona, index, newNodes));
        nodesChanged = true;
      } else {
        // Find and keep the existing persona
        const existingPersona = existingPersonas.find(existing => 
          existing.data?.name === persona.name && existing.data?.role === persona.role
        );
        if (existingPersona) {
          newNodes.push(existingPersona);
          processedPersonaIds.add(existingPersona.id);
        }
      }
    });
    
    // Add any existing personas that weren't in the new data
    existingPersonas.forEach(persona => {
      if (!processedPersonaIds.has(persona.id)) {
        newNodes.push(persona);
      }
    });
  } else if (ideationData.targetUsers && !ideationData.userPersonas) {
    // Check if legacy persona already exists
    const legacyPersonaExists = existingIdeationNodes.some(node => 
      node.data?.metadata?.nodeType === 'userPersona' &&
      node.data?.painPoint === ideationData.targetUsers
    );
  
    if (!legacyPersonaExists) {
      newNodes.push(nodeFactory.createLegacyUserPersonaNode(ideationData.targetUsers, newNodes));
      nodesChanged = true;
    } else {
      // Find and keep the existing legacy persona
      const existingLegacyPersona = existingIdeationNodes.find(node => 
        node.data?.metadata?.nodeType === 'userPersona' &&
        node.data?.painPoint === ideationData.targetUsers
      );
      if (existingLegacyPersona) {
        newNodes.push(existingLegacyPersona);
      }
    }
  }

  // Process competitors if available
  // Check for both competitors (string) and competitorData (array)
  if ((ideationData.competitors && Array.isArray(ideationData.competitors)) || 
      (ideationData.competitorData && Array.isArray(ideationData.competitorData))) {
    
    // Determine which data source to use
    const competitorArray = Array.isArray(ideationData.competitorData) 
      ? ideationData.competitorData 
      : ideationData.competitors;
    
    // Get existing competitor nodes
    const existingCompetitors = existingIdeationNodes.filter(node => 
      node.type === 'competitor'
    );
    
    // Track which existing competitors we've processed
    const processedCompetitorIds = new Set<string>();
    
    // Add new competitors that don't already exist
    competitorArray.forEach((competitor: any, index: number) => {
      // Check if this competitor already exists by name
      const competitorExists = existingCompetitors.some(existing => 
        existing.data?.name === competitor.name
      );
      
      if (!competitorExists && competitor.name) {
        newNodes.push(nodeFactory.createCompetitorNode(competitor, index, newNodes));
        nodesChanged = true;
      } else if (competitor.name) {
        // Find and keep the existing competitor
        const existingCompetitor = existingCompetitors.find(existing => 
          existing.data?.name === competitor.name
        );
        if (existingCompetitor) {
          newNodes.push(existingCompetitor);
          processedCompetitorIds.add(existingCompetitor.id);
        }
      }
    });
    
    // Add any existing competitors that weren't in the new data
    existingCompetitors.forEach(competitor => {
      if (!processedCompetitorIds.has(competitor.id)) {
        newNodes.push(competitor);
      }
    });
  }
  
  // Process platform if available
  if (ideationData.platform) {
    // Check if platform node already exists
    const existingPlatformNode = existingIdeationNodes.find(node => 
      node.type === 'platform');
    
    if (existingPlatformNode) {
      // Update existing node
      if (existingPlatformNode.data?.platform !== ideationData.platform) {
        const updatedNode = {
          ...existingPlatformNode,
          data: {
            ...existingPlatformNode.data,
            platform: ideationData.platform
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingPlatformNode);
      }
    } else {
      // Create new node
      newNodes.push(nodeFactory.createPlatformNode(ideationData.platform, newNodes));
      nodesChanged = true;
    }
  }
  
  // Process tech stack if available
  if (ideationData.techStack && Array.isArray(ideationData.techStack) && ideationData.techStack.length > 0) {
    // Check if tech stack node already exists
    const existingTechStackNode = existingIdeationNodes.find(node => 
      node.type === 'techStack');
    
    if (existingTechStackNode) {
      // Update existing node
      if (!areArraysEqual(existingTechStackNode.data?.techStack, ideationData.techStack)) {
        const updatedNode = {
          ...existingTechStackNode,
          data: {
            ...existingTechStackNode.data,
            techStack: ideationData.techStack
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingTechStackNode);
      }
    } else {
      // Create new node
      newNodes.push(nodeFactory.createTechStackNode(ideationData.techStack, newNodes));
      nodesChanged = true;
    }
  }
  
  // Process UI style if available
  if (ideationData.uiStyle) {
    // Check if UI style node already exists
    const existingUIStyleNode = existingIdeationNodes.find(node => 
      node.type === 'uiStyle');
    
    if (existingUIStyleNode) {
      // Update existing node
      if (existingUIStyleNode.data?.uiStyle !== ideationData.uiStyle) {
        const updatedNode = {
          ...existingUIStyleNode,
          data: {
            ...existingUIStyleNode.data,
            uiStyle: ideationData.uiStyle
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingUIStyleNode);
      }
    } else {
      // Create new node
      newNodes.push(nodeFactory.createUIStyleNode(ideationData.uiStyle, newNodes));
      nodesChanged = true;
    }
  }
  
  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed ideation data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
}