/**
 * ideationProcessor.ts
 * 
 * Processes ideation and discovery stage data into canvas nodes.
 * Handles the creation and updating of nodes related to app concept,
 * problem statement, user personas, etc.
 */

import { Node } from 'reactflow';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import { STAGE1_NODE_TYPES } from '../../../components/canvas/customnodetypes/stage1nodes';
import * as nodeFactory from '../nodeFactory';

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
  
  if (!ideationData || JSON.stringify(ideationData) === JSON.stringify(lastIdeationData)) {
    return nodes;
  }

  // Only replace specific singleton nodes (like app name), not all ideation nodes
  const existingAppNameNode = nodes.find(node => node.id === STAGE1_NODE_TYPES.APP_NAME);
  const existingTaglineNode = nodes.find(node => node.id === STAGE1_NODE_TYPES.TAGLINE);
  const existingCoreProblemNode = nodes.find(node => node.id === STAGE1_NODE_TYPES.CORE_PROBLEM);
  const existingMissionNode = nodes.find(node => node.id === STAGE1_NODE_TYPES.MISSION);
  const existingValuePropNode = nodes.find(node => node.id === STAGE1_NODE_TYPES.VALUE_PROPOSITION);

  // Create or update singleton nodes (these should replace existing ones)
  if (ideationData.appName && (!existingAppNameNode || existingAppNameNode.value !== ideationData.appName)) {
    if (existingAppNameNode) {
      // Update existing node
      const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.APP_NAME);
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          value: ideationData.appName,
          nameHistory: [...(nodes[index].nameHistory || []), nodes[index].value]
            .filter((name): name is string => name !== undefined && name !== null && name.trim() !== '')
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createAppNameNode(ideationData.appName, nodes));
    }
  }

  if (ideationData.tagline && (!existingTaglineNode || existingTaglineNode.value !== ideationData.tagline)) {
    if (existingTaglineNode) {
      // Update existing node
      const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.TAGLINE);
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          value: ideationData.tagline
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createTaglineNode(ideationData.tagline, nodes));
    }
  }

  if (ideationData.problemStatement && (!existingCoreProblemNode || existingCoreProblemNode.value !== ideationData.problemStatement)) {
    if (existingCoreProblemNode) {
      // Update existing node
      const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.CORE_PROBLEM);
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          value: ideationData.problemStatement
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createCoreProblemNode(ideationData.problemStatement, nodes));
    }
  }

  if (ideationData.appIdea && (!existingMissionNode || existingMissionNode.value !== ideationData.appIdea)) {
    if (existingMissionNode) {
      // Update existing node
      const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.MISSION);
      if (index !== -1) {
        const updates: Partial<CanvasNodeData> = { 
          value: ideationData.appIdea 
        };

        // Add mission statement if available
        if (ideationData.missionStatement) {
          updates.missionStatement = ideationData.missionStatement;
        }
        
        nodes[index] = {
          ...nodes[index],
          ...updates
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createMissionNode(ideationData.appIdea, ideationData.missionStatement, nodes));
    }
  }

  if (ideationData.valueProposition && (!existingValuePropNode || existingValuePropNode.value !== ideationData.valueProposition)) {
    if (existingValuePropNode) {
      // Update existing node
      const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.VALUE_PROPOSITION);
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          value: ideationData.valueProposition
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createValuePropNode(ideationData.valueProposition, nodes));
    }
  }

  // For multi-instance nodes like user personas, only add new ones
  if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
    const existingPersonas = nodes.filter(node => 
      node.metadata?.stage === 'ideation-discovery' && node.metadata?.nodeType === 'userPersona'
    );
  
    // Only add personas that don't already exist
    ideationData.userPersonas.forEach((persona: any, index: number) => {
      const personaExists = existingPersonas.some(existing => 
        existing.name === persona.name && existing.role === persona.role
      );
    
      if (!personaExists) {
        nodes.push(nodeFactory.createUserPersonaNode(persona, index, nodes));
      }
    });
  } else if (ideationData.targetUsers && !ideationData.userPersonas) {
    // Check if legacy persona already exists
    const legacyPersonaExists = nodes.some(node => 
      node.metadata?.stage === 'ideation-discovery' && 
      node.metadata?.nodeType === 'userPersona' &&
      node.painPoint === ideationData.targetUsers
    );
  
    if (!legacyPersonaExists) {
      nodes.push(nodeFactory.createLegacyUserPersonaNode(ideationData.targetUsers, nodes));
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
    const existingCompetitors = nodes.filter(node => 
      node.metadata?.stage === 'ideation-discovery' && node.type === 'competitor'
    );
    
    // Add new competitors that don't already exist
    competitorArray.forEach((competitor: any, index: number) => {
      // Check if this competitor already exists by name
      const competitorExists = existingCompetitors.some(existing => 
        existing.name === competitor.name
      );
      
      if (!competitorExists && competitor.name) {
        nodes.push(nodeFactory.createCompetitorNode(competitor, index, nodes));
      }
    });
  }
  
  // Process platform if available
  if (ideationData.platform) {
    // Check if platform node already exists
    const existingPlatformNode = nodes.find(node => 
      node.type === 'platform' && node.metadata?.stage === 'ideation-discovery');
    
    if (existingPlatformNode) {
      // Update existing node
      const index = nodes.findIndex(node => 
        node.type === 'platform' && node.metadata?.stage === 'ideation-discovery');
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          platform: ideationData.platform
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createPlatformNode(ideationData.platform, nodes));
    }
  }
  
  // Process tech stack if available
  if (ideationData.techStack && Array.isArray(ideationData.techStack) && ideationData.techStack.length > 0) {
    // Check if tech stack node already exists
    const existingTechStackNode = nodes.find(node => 
      node.type === 'techStack' && node.metadata?.stage === 'ideation-discovery');
    
    if (existingTechStackNode) {
      // Update existing node
      const index = nodes.findIndex(node => 
        node.type === 'techStack' && node.metadata?.stage === 'ideation-discovery');
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          techStack: ideationData.techStack
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createTechStackNode(ideationData.techStack, nodes));
    }
  }
  
  // Process UI style if available
  if (ideationData.uiStyle) {
    // Check if UI style node already exists
    const existingUIStyleNode = nodes.find(node => 
      node.type === 'uiStyle' && node.metadata?.stage === 'ideation-discovery');
    
    if (existingUIStyleNode) {
      // Update existing node
      const index = nodes.findIndex(node => 
        node.type === 'uiStyle' && node.metadata?.stage === 'ideation-discovery');
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          uiStyle: ideationData.uiStyle
        };
      }
    } else {
      // Create new node
      nodes.push(nodeFactory.createUIStyleNode(ideationData.uiStyle, nodes));
    }
  }
  
  console.log('Processed ideation data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}