/**
 * CanvasDataProcessor.tsx
 * 
 * Orchestrator for the SpatialCanvas data processing system.
 * Coordinates the transformation of stage data into visual canvas nodes
 * by delegating to specialized processor modules.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Converts structured stage data into renderable canvas nodes
 * - Maintains ephemeral state - nodes persist across stage transitions
 * - Handles incremental updates without full canvas resets
 * - Preserves user positioning and customizations
 * - Generates AI analysis nodes based on project completeness
 * 
 */

import { CanvasNodeData } from '../CanvasNode';
import * as processors from '../../../lib/canvas/processors';
import * as nodeFactory from '../../../lib/canvas/nodeFactory';
import { getSmartNodePosition } from '../../../lib/canvas/nodePlacementUtils';

export interface ProcessorState {
  nodes: CanvasNodeData[];
  lastProcessedData?: { [key: string]: any };
}

interface Position {
  x: number;
  y: number;
}

export class CanvasDataProcessor {
  private static lastProcessedHash = '';

  /**
   * Main processing function - transforms stage data into canvas nodes
   * This is the heart of the spatial canvas system
   */
  static updateCanvasFromStageData(
    stageData: any,
    currentState: ProcessorState,
    onStateUpdate: (newState: ProcessorState) => void
  ): void {
    console.log('CanvasDataProcessor.updateCanvasFromStageData called with:', {
      stageDataKeys: Object.keys(stageData),
      currentNodeCount: currentState.nodes.length
    });
    
    console.log('CanvasDataProcessor.updateCanvasFromStageData called with:', {
      stageDataKeys: Object.keys(stageData),
      currentNodeCount: currentState.nodes.length,
      stageData: stageData
    });
    
    // Create a more stable hash that ignores order and minor changes
    const currentDataHash = this.createStableHash(stageData);
    
    if (currentDataHash === this.lastProcessedHash) {
      console.log('No meaningful stage data changes detected, skipping update');
      return;
    }

    // Store the hash to prevent reprocessing
    this.lastProcessedHash = currentDataHash;

    // First, collect all nodes that should be generated from the current stage data
    let generatedNodes: CanvasNodeData[] = [];
    console.log('Generating nodes from stage data...');
    
    // Generate nodes for each stage
    const ideationNodes = this._generateIdeationNodes(stageData);
    const featureNodes = this._generateFeatureNodes(stageData);
    const structureNodes = this._generateStructureNodes(stageData);
    const architectureNodes = this._generateArchitectureNodes(stageData);
    const interfaceNodes = this._generateInterfaceNodes(stageData);
    const authNodes = this._generateAuthNodes(stageData);
    
    // Combine all generated nodes
    generatedNodes = [
      ...ideationNodes,
      ...featureNodes,
      ...structureNodes,
      ...architectureNodes,
      ...interfaceNodes,
      ...authNodes
    ];
    updatedNodes = processors.processIdeationData(stageData, currentState, updatedNodes);
    updatedNodes = processors.processFeatureData(stageData, currentState, updatedNodes);
    updatedNodes = processors.processStructureData(stageData, currentState, updatedNodes);
    updatedNodes = processors.processArchitectureData(stageData, currentState, updatedNodes);
    updatedNodes = processors.processInterfaceData(stageData, currentState, updatedNodes);
    updatedNodes = processors.processAuthData(stageData, currentState, updatedNodes);
    
    // Generate AI analysis node
    const aiAnalysisNode = nodeFactory.createAIAnalysisNode(stageData, updatedNodes.length, updatedNodes);
    if (aiAnalysisNode) {
      // Find and remove any existing AI analysis nodes
      const existingAiNodes = updatedNodes.filter(node => node.metadata?.generated);
      updatedNodes = updatedNodes.filter(node => !node.metadata?.generated);
      
      // Position the new AI node intelligently
      if (updatedNodes.length > 0) {
        aiAnalysisNode.position = getSmartNodePosition(
          updatedNodes,
          aiAnalysisNode.size,
          'agent-output',
          { x: 0, y: 0 },
          undefined,
          false
        );
      }
      
      console.log('Adding AI analysis node');
      updatedNodes.push(aiAnalysisNode);
    }
    
    // Update state with updated nodes
    onStateUpdate({
      nodes: updatedNodes,
      lastProcessedData: { ...stageData }
    });
    console.log('Canvas data processor completed, returning', updatedNodes.length, 'nodes');
  }

  /**
   * Reconcile generated nodes with existing nodes to preserve positions and other properties
   */
  private static _reconcileNodes(existingNodes: CanvasNodeData[], generatedNodes: CanvasNodeData[]): CanvasNodeData[] {
    console.log('_reconcileNodes called with:', {
      existingCount: existingNodes.length,
      generatedCount: generatedNodes.length
    });
    
    // Create a map of existing nodes by ID for quick lookup
    const existingNodesMap = new Map<string, CanvasNodeData>();
    existingNodes.forEach(node => {
      existingNodesMap.set(node.id, node);
    });
    
    // Process each generated node
    const reconciled = generatedNodes.map(newNode => {
      const existingNode = existingNodesMap.get(newNode.id);
      
      if (existingNode) {
        // Node exists - preserve position, size, and connections
        console.log(`Preserving properties for node: ${newNode.id}`);
        return {
          ...newNode,
          position: existingNode.position,
          size: existingNode.size,
          connections: existingNode.connections,
          // Preserve other user-customizable properties
          collapsed: existingNode.collapsed,
          // For custom node types, preserve their specific properties
          ...(newNode.type === 'userPersona' && {
            emoji: existingNode.emoji || newNode.emoji
          }),
          ...(newNode.type === 'coreProblem' && {
            keywords: existingNode.keywords || newNode.keywords
          }),
          ...(newNode.type === 'valueProp' && {
            bulletPoints: existingNode.bulletPoints || newNode.bulletPoints
          }),
          ...(newNode.type === 'appName' && {
            nameHistory: existingNode.nameHistory || newNode.nameHistory
          })
        };
      }
      
      // New node - use as is
      return newNode;
    });
    
    // Add any existing nodes that aren't stage-specific (user-created generic nodes)
    existingNodes.forEach(node => {
      // If the node doesn't have a stage metadata or isn't in the generated nodes,
      // and it's not an AI-generated node, keep it
      if (
        (!node.metadata?.stage || !generatedNodes.some(n => n.id === node.id)) &&
        !node.metadata?.generated
      ) {
        console.log(`Preserving user-created node: ${node.id}`);
        reconciled.push(node);
      }
    });
    
    return reconciled;
  }

  /**
   * Generate nodes for Ideation & Discovery stage
   */
  private static _generateIdeationNodes(stageData: any): CanvasNodeData[] {
    const ideationData = stageData['ideation-discovery'];
    if (!ideationData) return [];
    
    const nodes: CanvasNodeData[] = [];
    
    // App Name
    if (ideationData.appName) {
      nodes.push(this.createAppNameNode(ideationData.appName));
    }
    
    // Tagline
    if (ideationData.tagline) {
      nodes.push(this.createTaglineNode(ideationData.tagline));
    }
    
    // Core Problem
    if (ideationData.problemStatement) {
      nodes.push(this.createCoreProblemNode(ideationData.problemStatement));
    }
    
    // Mission
    if (ideationData.appIdea) {
      nodes.push(this.createMissionNode(ideationData.appIdea, ideationData.missionStatement));
    }
    
    // Value Proposition
    if (ideationData.valueProposition) {
      nodes.push(this.createValuePropNode(ideationData.valueProposition));
    }
    
    // User Personas
    if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
      ideationData.userPersonas.forEach((persona: any, index: number) => {
        nodes.push(this.createUserPersonaNode(persona, index));
      });
    } else if (ideationData.targetUsers) {
      nodes.push(this.createLegacyUserPersonaNode(ideationData.targetUsers));
    }
    
    return nodes;
  }

  /**
   * Generate nodes for Feature Planning stage
   */
  private static _generateFeatureNodes(stageData: any): CanvasNodeData[] {
    const featureData = stageData['feature-planning'];
    if (!featureData) return [];
    
    const nodes: CanvasNodeData[] = [];
    const baseX = 100;
    const baseY = 350;
    
    // Feature Packs
    if (featureData.selectedFeaturePacks) {
      featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
        const stableId = `feature-pack-${pack}`;
        nodes.push(this.createFeaturePackNode(pack, index, baseX, baseY, null, stableId));
      });
    }
    
    // Custom Features
    if (featureData.customFeatures) {
      const startIndex = featureData.selectedFeaturePacks?.length || 0;
      featureData.customFeatures.forEach((feature: any, index: number) => {
        const stableId = feature.id ? 
          `feature-custom-${feature.id}` : 
          `feature-custom-${feature.name.replace(/\s+/g, '-').toLowerCase()}`;
        nodes.push(this.createCustomFeatureNode(feature, startIndex + index, baseX, baseY, null, stableId));
      });
    }
    
    // Natural Language Features
    if (featureData.naturalLanguageFeatures) {
      nodes.push(this.createNaturalLanguageFeatureNode(featureData.naturalLanguageFeatures, null, 'feature-natural-language'));
    }
    
    return nodes;
  }

  /**
   * Generate nodes for Structure & Flow stage
   */
  private static _generateStructureNodes(stageData: any): CanvasNodeData[] {
    const structureData = stageData['structure-flow'];
    if (!structureData) return [];
    
    const nodes: CanvasNodeData[] = [];
    const baseX = 100;
    const baseY = 600;
    
    // Screens
    if (structureData.screens) {
      structureData.screens.forEach((screen: any, index: number) => {
        const stableId = screen.id ? 
          `screen-${screen.id}` : 
          `screen-${screen.name.replace(/\s+/g, '-').toLowerCase()}`;
        nodes.push(this.createScreenNode(screen, index, baseX, baseY, null, stableId));
      });
    }
    
    // User Flows
    if (structureData.userFlows) {
      structureData.userFlows.forEach((flow: any, index: number) => {
        const stableId = flow.id ? 
          `flow-${flow.id}` : 
          `flow-${flow.name.replace(/\s+/g, '-').toLowerCase()}`;
        nodes.push(this.createUserFlowNode(flow, index, baseX, baseY, null, stableId));
      });
    }
    
    return nodes;
  }

  /**
   * Generate nodes for Architecture Design stage
   */
  private static _generateArchitectureNodes(stageData: any): CanvasNodeData[] {
    const architectureData = stageData['architecture-design'];
    if (!architectureData) return [];
    
    const nodes: CanvasNodeData[] = [];
    const baseX = 100;
    const baseY = 800;
    
    // Database Schema
    if (architectureData.databaseSchema) {
      architectureData.databaseSchema.forEach((table: any, index: number) => {
        const stableId = table.id ? 
          `db-table-${table.id}` : 
          `db-table-${table.name.replace(/\s+/g, '-').toLowerCase()}`;
        nodes.push(this.createDatabaseTableNode(table, index, baseX, baseY, null, stableId));
      });
    }
    
    // API Endpoints
    if (architectureData.apiEndpoints) {
      nodes.push(this.createAPIEndpointsNode(architectureData.apiEndpoints, baseX, baseY, null, 'api-endpoints'));
    }
    
    // Routes
    if (architectureData.sitemap) {
      architectureData.sitemap.forEach((route: any, index: number) => {
        const stableId = route.id ? 
          `route-${route.id}` : 
          `route-${route.path.replace(/\//g, '-').replace(/:/g, '')}`;
        nodes.push(this.createRouteNode(route, index, baseX, baseY, null, stableId));
      });
    }
    
    return nodes;
  }

  /**
   * Generate nodes for Interface & Interaction stage
   */
  private static _generateInterfaceNodes(stageData: any): CanvasNodeData[] {
    const interfaceData = stageData['interface-interaction'];
    if (!interfaceData) return [];
    
    const nodes: CanvasNodeData[] = [];
    const baseX = 100;
    const baseY = 1000;
    
    // Design System
    if (interfaceData.selectedDesignSystem) {
      nodes.push(this.createDesignSystemNode(interfaceData.selectedDesignSystem, baseX, baseY, null, 'design-system'));
    }
    
    // Custom Branding
    if (interfaceData.customBranding) {
      nodes.push(this.createBrandingNode(interfaceData.customBranding, baseX, baseY, null, 'brand-colors'));
    }
    
    // Layout Blocks
    if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
      nodes.push(this.createLayoutNode(interfaceData.layoutBlocks, baseX, baseY, null, 'layout-structure'));
    }
    
    return nodes;
  }

  /**
   * Generate nodes for User & Auth Flow stage
   */
  private static _generateAuthNodes(stageData: any): CanvasNodeData[] {
    const authData = stageData['user-auth-flow'];
    if (!authData) return [];
    
    const nodes: CanvasNodeData[] = [];
    const baseX = 100;
    const baseY = 1200;
    
    // Auth Methods
    if (authData.authMethods) {
      const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
      if (enabledMethods.length > 0) {
        nodes.push(this.createAuthMethodsNode(enabledMethods, baseX, baseY, null, 'auth-methods'));
      }
    }
    
    // User Roles
    if (authData.userRoles && authData.userRoles.length > 0) {
      nodes.push(this.createUserRolesNode(authData.userRoles, baseX, baseY, null, 'user-roles'));
    }
    
    // Security Features
    if (authData.securityFeatures) {
      const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
      if (enabledSecurity.length > 0) {
        nodes.push(this.createSecurityFeaturesNode(enabledSecurity, baseX, baseY, null, 'security-features'));
      }
    }
    
    return nodes;
  }
  private static processIdeationData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const ideationData = stageData['ideation-discovery'];
    const lastIdeationData = (currentState.lastProcessedData || {})['ideation-discovery'] || {};
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
        // Update existing node but keep its position
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
        const newNode = this.createAppNameNode(ideationData.appName);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.appName.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    if (ideationData.tagline && (!existingTaglineNode || existingTaglineNode.value !== ideationData.tagline)) {
      if (existingTaglineNode) {
        // Update existing node but keep its position
        const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.TAGLINE);
        if (index !== -1) {
          nodes[index] = {
            ...nodes[index],
            value: ideationData.tagline
          };
        }
      } else {
        // Create new node
        const newNode = this.createTaglineNode(ideationData.tagline);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.tagline.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    if (ideationData.problemStatement && (!existingCoreProblemNode || existingCoreProblemNode.value !== ideationData.problemStatement)) {
      if (existingCoreProblemNode) {
        // Update existing node but keep its position
        const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.CORE_PROBLEM);
        if (index !== -1) {
          nodes[index] = {
            ...nodes[index],
            value: ideationData.problemStatement
          };
        }
      } else {
        // Create new node
        const newNode = this.createCoreProblemNode(ideationData.problemStatement);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.coreProblem.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    if (ideationData.appIdea && (!existingMissionNode || existingMissionNode.value !== ideationData.appIdea)) {
      if (existingMissionNode) {
        // Update existing node but keep its position
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
        const newNode = this.createMissionNode(ideationData.appIdea, ideationData.missionStatement);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.mission.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    if (ideationData.valueProposition && (!existingValuePropNode || existingValuePropNode.value !== ideationData.valueProposition)) {
      if (existingValuePropNode) {
        // Update existing node but keep its position
        const index = nodes.findIndex(node => node.id === STAGE1_NODE_TYPES.VALUE_PROPOSITION);
        if (index !== -1) {
          nodes[index] = {
            ...nodes[index],
            value: ideationData.valueProposition
          };
        }
      } else {
        // Create new node
        const newNode = this.createValuePropNode(ideationData.valueProposition);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.valueProp.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    // For multi-instance nodes like user personas, only add new ones
    if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
      // Create a map of existing personas by their unique properties
      const existingPersonasMap = new Map();
      nodes.filter(node => 
        node.metadata?.stage === 'ideation-discovery' && node.metadata?.nodeType === 'userPersona'
      ).forEach(node => {
        // Create a unique key based on persona properties
        const key = `${node.name}-${node.role}`;
        existingPersonasMap.set(key, node);
      });
      
      // Process each persona in the data
      ideationData.userPersonas.forEach((persona: any, index: number) => {
        const personaKey = `${persona.name}-${persona.role}`;
        const existingPersona = existingPersonasMap.get(personaKey);
        
        if (existingPersona) {
          // Update existing persona with new data but preserve position
          const personaIndex = nodes.findIndex(n => n.id === existingPersona.id);
          if (personaIndex !== -1) {
            nodes[personaIndex] = {
              ...nodes[personaIndex],
              name: persona.name || existingPersona.name,
              role: persona.role || existingPersona.role,
              painPoint: persona.painPoint || existingPersona.painPoint,
              emoji: persona.emoji || existingPersona.emoji
            };
          }
          // Remove from map to track which ones we've processed
          existingPersonasMap.delete(personaKey);
        } else {
          // Create new persona node
         const existingPersona = nodes.find(node => 
  node.metadata?.stage === 'ideation-discovery' && 
  node.metadata?.nodeType === 'userPersona' &&
  node.name === persona.name && node.role === persona.role
);

if (!existingPersona) {        
  const newNode = this.createUserPersonaNode(persona, index);
  // Use smart positioning for new node
  newNode.position = getSmartNodePosition(
    nodes,
    newNode.size,
    newNode.type,
    {
      x: STAGE1_NODE_DEFAULTS.userPersona.position.x + (index * 30),
      y: STAGE1_NODE_DEFAULTS.userPersona.position.y + (index * 20)
    },
    'ideation-discovery'
  );
  nodes.push(newNode);
}
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
        const newNode = this.createLegacyUserPersonaNode(ideationData.targetUsers);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          STAGE1_NODE_DEFAULTS.userPersona.position,
          'ideation-discovery'
        );
        nodes.push(newNode);
      }
    }

    console.log('Processed ideation data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static processFeatureData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const featureData = stageData['feature-planning'];
    const lastFeatureData = (currentState.lastProcessedData || {})['feature-planning'] || {};
    const originalNodeCount = nodes.length;
    
    if (!featureData || JSON.stringify(featureData) === JSON.stringify(lastFeatureData)) {
      return nodes;
    }

    let featureX = 100;
    let featureY = 350;

    // Remove old feature nodes but keep track of their positions for reference
    const oldFeaturePositions: Record<string, Position> = {};
    nodes.filter(node => 
      node?.metadata?.stage === 'feature-planning'
    ).forEach(node => {
      if (node && node.position) {
        oldFeaturePositions[node.type] = { 
          x: node.position.x, 
          y: node.position.y 
        };
      }
    });
    
    // Now remove the old nodes
    nodes = nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'feature-planning');

    // Process selected feature packs
    if (featureData.selectedFeaturePacks) {
      featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {        
        const newNode = this.createFeaturePackNode(pack, index, featureX, featureY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: featureX + (index % 3) * 200, 
            y: featureY + Math.floor(index / 3) * 120 
          },
          'feature-planning'
        );
        nodes.push(newNode);
      });
    }

    // Process custom features
    if (featureData.customFeatures) {
      const startIndex = featureData.selectedFeaturePacks?.length || 0;
      featureData.customFeatures.forEach((feature: any, index: number) => {        
        const newNode = this.createCustomFeatureNode(feature, startIndex + index, featureX, featureY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: featureX + ((startIndex + index) % 3) * 200, 
            y: featureY + Math.floor((startIndex + index) / 3) * 120 
          },
          'feature-planning'
        );
        nodes.push(newNode);
      });
    }

    // Add natural language features if provided
    if (featureData.naturalLanguageFeatures) {
      const newNode = this.createNaturalLanguageFeatureNode(featureData.naturalLanguageFeatures);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: 700, y: 350 },
        'feature-planning'
      );
      nodes.push(newNode);
    }

    console.log('Processed feature data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static processStructureData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const structureData = stageData['structure-flow'];
    const lastStructureData = (currentState.lastProcessedData || {})['structure-flow'] || {};
    const originalNodeCount = nodes.length;
    
    if (!structureData || JSON.stringify(structureData) === JSON.stringify(lastStructureData)) {
      return nodes;
    }

    let flowX = 100;
    let flowY = 600;

    // Remove old structure nodes but keep track of their positions for reference
    const oldStructurePositions: Record<string, Position> = {};
    nodes.filter(node => 
      node?.metadata?.stage === 'structure-flow'
    ).forEach(node => {
      if (node && node.position) {
        oldStructurePositions[node.type] = { 
          x: node.position.x, 
          y: node.position.y 
        };
      }
    });
    
    // Now remove the old nodes
    nodes = nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'structure-flow');

    // Process screens
    if (structureData.screens) {
      structureData.screens.forEach((screen: any, index: number) => {        
        const newNode = this.createScreenNode(screen, index, flowX, flowY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: flowX + (index % 4) * 160, 
            y: flowY 
          },
          'structure-flow'
        );
        nodes.push(newNode);
      });
    }

    // Process user flows
    if (structureData.userFlows) {
      structureData.userFlows.forEach((flow: any, index: number) => {        
        const newNode = this.createUserFlowNode(flow, index, flowX, flowY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: flowX + (index % 3) * 220, 
            y: flowY + 120 
          },
          'structure-flow'
        );
        nodes.push(newNode);
      });
    }

    console.log('Processed structure data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static processArchitectureData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const architectureData = stageData['architecture-design'];
    const lastArchitectureData = (currentState.lastProcessedData || {})['architecture-design'] || {};
    const originalNodeCount = nodes.length;
    
    if (!architectureData || JSON.stringify(architectureData) === JSON.stringify(lastArchitectureData)) {
      return nodes;
    }

    let systemX = 100;
    let systemY = 800;

    // Remove old architecture nodes but keep track of their positions for reference
    const oldArchitecturePositions: Record<string, Position> = {};
    nodes.filter(node => 
      node?.metadata?.stage === 'architecture-design'
    ).forEach(node => {
      if (node && node.position) {
        oldArchitecturePositions[node.type] = { 
          x: node.position.x, 
          y: node.position.y 
        };
      }
    });
    
    // Now remove the old nodes
    nodes = nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'architecture-design');

    // Process database schema
    if (architectureData.databaseSchema) {
      architectureData.databaseSchema.forEach((table: any, index: number) => {        
        const newNode = this.createDatabaseTableNode(table, index, systemX, systemY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: systemX + (index % 3) * 200, 
            y: systemY 
          },
          'architecture-design'
        );
        nodes.push(newNode);
      });
    }

    // Process API endpoints
    if (architectureData.apiEndpoints) {
      const newNode = this.createAPIEndpointsNode(architectureData.apiEndpoints, systemX, systemY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: systemX + 400, y: systemY },
        'architecture-design'
      );
      nodes.push(newNode);
    }

    // Process other architecture components
    if (architectureData.sitemap) {
      architectureData.sitemap.forEach((route: any, index: number) => {        
        const newNode = this.createRouteNode(route, index, systemX, systemY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { 
            x: systemX + (index % 4) * 150, 
            y: systemY + 120 
          },
          'architecture-design'
        );
        nodes.push(newNode);
      });
    }

    console.log('Processed architecture data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static processInterfaceData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const interfaceData = stageData['interface-interaction'] || {};
    const lastInterfaceData = (currentState.lastProcessedData || {})['interface-interaction'] || {};
    const originalNodeCount = nodes.length;
    
    if (!interfaceData || JSON.stringify(interfaceData) === JSON.stringify(lastInterfaceData)) {
      return nodes;
    }

    let uiX = 100;
    let uiY = 1000;

    // Remove old interface nodes but keep track of their positions for reference
    const oldInterfacePositions: Record<string, Position> = {};
    nodes.filter(node => 
      node?.metadata?.stage === 'interface-interaction'
    ).forEach(node => {
      if (node && node.position) {
        oldInterfacePositions[node.type] = { 
          x: node.position.x, 
          y: node.position.y 
        };
      }
    });
    
    // Now remove the old nodes
    nodes = nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'interface-interaction');

    // Process design system
    if (interfaceData.selectedDesignSystem) {
      const newNode = this.createDesignSystemNode(interfaceData.selectedDesignSystem, uiX, uiY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: uiX, y: uiY },
        'interface-interaction'
      );
      nodes.push(newNode);
    }

    // Process custom branding
    if (interfaceData.customBranding) {
      const newNode = this.createBrandingNode(interfaceData.customBranding, uiX, uiY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: uiX + 180, y: uiY },
        'interface-interaction'
      );
      nodes.push(newNode);
    }

    // Process layout blocks
    if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
      const newNode = this.createLayoutNode(interfaceData.layoutBlocks, uiX, uiY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: uiX + 340, y: uiY },
        'interface-interaction'
      );
      nodes.push(newNode);
    }

    console.log('Processed interface data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static processAuthData(stageData: any, currentState: ProcessorState, nodes: CanvasNodeData[], preservePositions: boolean = false): CanvasNodeData[] {
    const authData = stageData['user-auth-flow'] || {};
    const lastAuthData = (currentState.lastProcessedData || {})['user-auth-flow'] || {};
    const originalNodeCount = nodes.length;
    
    if (!authData || JSON.stringify(authData) === JSON.stringify(lastAuthData)) {
      return nodes;
    }

    let authX = 100;
    let authY = 1200;

    // Remove old auth nodes but keep track of their positions for reference
    const oldAuthPositions: Record<string, Position> = {};
    nodes.filter(node => 
      node?.metadata?.stage === 'user-auth-flow'
    ).forEach(node => {
      if (node && node.position) {
        oldAuthPositions[node.type] = { 
          x: node.position.x, 
          y: node.position.y 
        };
      }
    });
    
    // Now remove the old nodes
    nodes = nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'user-auth-flow');

    // Process authentication methods
    if (authData.authMethods) {
      const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
      if (enabledMethods.length > 0) {
        const newNode = this.createAuthMethodsNode(enabledMethods, authX, authY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { x: authX, y: authY },
  /**
   * Create stable hash function that ignores object key ordering
   */
  private static createStableHash(data: any): string {
    // Create a hash that's stable across object key reordering
    const sortedData = this.sortObjectKeys(data);
    return JSON.stringify(sortedData);
  }

  /**
   * Recursively sort object keys to ensure consistent hashing
   */
  private static sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item));
    
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key]);
    });
    return sorted;
  }
}