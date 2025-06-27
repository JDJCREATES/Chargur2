/**
 * CanvasDataProcessor.tsx
 * 
 * Core data processing engine for the SpatialCanvas system.
 * Responsible for transforming stage data into visual canvas nodes.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Converts structured stage data into renderable canvas nodes
 * - Maintains ephemeral state - nodes persist across stage transitions
 * - Handles incremental updates without full canvas resets
 * - Preserves user positioning and customizations
 * - Generates AI analysis nodes based on project completeness
 * 
 * CRITICAL FUNCTIONALITY:
 * - updateCanvasFromStageData: Core function that processes all stage data
 * - Additive approach: Only adds new nodes, preserves existing ones
 * - Stage-specific node generation with proper metadata
 * - Cross-stage intelligence and recommendations
 */

import { CanvasNodeData } from '../CanvasNode';
import { STAGE1_NODE_TYPES, STAGE1_NODE_DEFAULTS } from '../customnodetypes/stage1nodes';
import { getSmartNodePosition } from '../../../lib/canvas/nodePlacementUtils';

export interface ProcessorState {
  nodes: CanvasNodeData[];
  lastProcessedData?: { [key: string]: any };
}

export class CanvasDataProcessor {
  private static nodeIdCounter = 1;
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
    
    console.log('Generated nodes from stage data:', generatedNodes.length);
    
    // Now reconcile with existing nodes to preserve positions and other properties
    let updatedNodes = this._reconcileNodes(currentState.nodes, generatedNodes);
    console.log('After reconciliation:', updatedNodes.length, 'nodes');
    
    // Generate AI analysis node
    const aiAnalysisNode = this.generateAIAnalysisNode(stageData, updatedNodes.length);
    if (aiAnalysisNode) {
      // Remove any existing AI analysis nodes
      updatedNodes = updatedNodes.filter(node => !node.metadata?.generated);
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
          const existing = nodes.find(node => 
            node.metadata?.stage === 'ideation-discovery' && 
            node.metadata?.nodeType === 'userPersona' &&
            existing.name === persona.name && existing.role === persona.role
          );
          
          if (!existing) {        
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
      
      // Optional: Remove personas that no longer exist in the data
      // Uncomment if you want to remove personas that aren't in the current data
      /*
      if (preservePositions) {
        // Keep all nodes even if they're not in the current data
      } else {
        // Remove personas that aren't in the current data
        existingPersonasMap.forEach((node) => {
          const index = nodes.findIndex(n => n.id === node.id);
          if (index !== -1) {
            nodes.splice(index, 1);
          }
        });
      }
      */
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
          'user-auth-flow'
        );
        nodes.push(newNode);
      }
    }

    // Process user roles
    if (authData.userRoles && authData.userRoles.length > 0) {
      const newNode = this.createUserRolesNode(authData.userRoles, authX, authY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: authX + 200, y: authY },
        'user-auth-flow'
      );
      nodes.push(newNode);
    }

    // Process security features
    if (authData.securityFeatures) {
      const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
      if (enabledSecurity.length > 0) {
        const newNode = this.createSecurityFeaturesNode(enabledSecurity, authX, authY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { x: authX, y: authY + 120 },
          'user-auth-flow'
        );
        nodes.push(newNode);
      }
    }

    console.log('Processed auth data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  private static generateAIAnalysisNode(stageData: any, nodeCount: number): CanvasNodeData | null {
    if (nodeCount === 0) {
      return null; // Don't create analysis node for empty canvas
    }
    
    // Generate AI analysis based on project completeness
    const completedStages = Object.keys(stageData).length;
    if (completedStages === 0) return null;
    
    // Create the AI analysis node
    const aiNode = {
      id: `ai-analysis-${this.nodeIdCounter++}`,
      type: 'agent-output',
      title: 'AI Analysis',
      content: `Project has ${completedStages} completed stages`,
      size: { width: 200, height: 120 },
      color: 'gray',
      connections: [],
      metadata: {
        generated: true,
        stagesCompleted: completedStages,
        totalNodes: nodeCount
      },
      resizable: true
    } as CanvasNodeData;
    
    // Use smart positioning for the AI analysis node
    aiNode.position = getSmartNodePosition(
      nodes,
      aiNode.size,
      aiNode.type,
      { x: 100 + (nodeCount * 10), y: 100 + (nodeCount * 10) },
      'ai-analysis'
    );
    
    return {
      ...aiNode
    };
  }

  // Node creation helper methods
  private static createAppNameNode(appName: string, existingNode?: CanvasNodeData | null): CanvasNodeData {
    const position = existingNode?.position || STAGE1_NODE_DEFAULTS.appName.position;
    const size = existingNode?.size || STAGE1_NODE_DEFAULTS.appName.size;
    const connections = existingNode?.connections || [];
    
    return {
      id: STAGE1_NODE_TYPES.APP_NAME,
      type: 'appName',
      title: 'App Name',
      content: '',
      position: position,
      size: size,
      color: 'appName',
      connections: connections,
      metadata: { stage: 'ideation-discovery', nodeType: 'appName' },
      value: appName,
      editable: true,
      nameHistory: [],
      resizable: true
    };
  }

  private static createTaglineNode(tagline: string, existingNode?: CanvasNodeData | null): CanvasNodeData {
    const position = existingNode?.position || STAGE1_NODE_DEFAULTS.tagline.position;
    const size = existingNode?.size || STAGE1_NODE_DEFAULTS.tagline.size;
    const connections = existingNode?.connections || [];
    
    return {
      id: STAGE1_NODE_TYPES.TAGLINE,
      type: 'tagline',
      title: 'Tagline',
      content: '',
      position: position,
      size: size,
      color: 'tagline',
      connections: connections,
      metadata: { stage: 'ideation-discovery', nodeType: 'tagline' },
      value: tagline,
      editable: true,
      resizable: true
    };
  }

  private static createCoreProblemNode(problemStatement: string, existingNode?: CanvasNodeData | null): CanvasNodeData {
    const position = existingNode?.position || STAGE1_NODE_DEFAULTS.coreProblem.position;
    const size = existingNode?.size || STAGE1_NODE_DEFAULTS.coreProblem.size;
    const connections = existingNode?.connections || [];
    const keywords = existingNode?.keywords || [];
    
    return {
      id: STAGE1_NODE_TYPES.CORE_PROBLEM,
      type: 'coreProblem',
      title: 'Core Problem',
      content: '',
      position: position,
      size: size,
      color: 'coreProblem',
      connections: connections,
      metadata: { stage: 'ideation-discovery', nodeType: 'coreProblem' },
      value: problemStatement,
      editable: true,
      keywords: keywords,
      resizable: true
    };
  }

  private static createMissionNode(appIdea: string, missionStatement?: string, existingNode?: CanvasNodeData | null): CanvasNodeData {
    const position = existingNode?.position || STAGE1_NODE_DEFAULTS.mission.position;
    const size = existingNode?.size || STAGE1_NODE_DEFAULTS.mission.size;
    const connections = existingNode?.connections || [];
    
    return {
      id: STAGE1_NODE_TYPES.MISSION,
      type: 'mission',
      title: 'Mission',
      content: '',
      position: position,
      size: size,
      color: 'mission',
      connections: connections,
      metadata: { stage: 'ideation-discovery', nodeType: 'mission' },
      value: appIdea,
      missionStatement: missionStatement || '',
      editable: true,
      resizable: true
    };
  }

  private static createValuePropNode(valueProposition: string, existingNode?: CanvasNodeData | null): CanvasNodeData {
    const position = existingNode?.position || STAGE1_NODE_DEFAULTS.valueProp.position;
    const size = existingNode?.size || STAGE1_NODE_DEFAULTS.valueProp.size;
    const connections = existingNode?.connections || [];
    const bulletPoints = existingNode?.bulletPoints || [];
    
    return {
      id: STAGE1_NODE_TYPES.VALUE_PROPOSITION,
      type: 'valueProp',
      title: 'Value Proposition',
      content: '',
      position: position,
      size: size,
      color: 'valueProp',
      connections: connections,
      metadata: { stage: 'ideation-discovery', nodeType: 'valueProp' },
      value: valueProposition,
      editable: true,
      bulletPoints: bulletPoints,
      resizable: true
    };
  }

  private static createUserPersonaNode(persona: any, index: number): CanvasNodeData {
    // Generate a stable ID based on persona properties
    const stableId = persona.id ? 
      `userPersona-${persona.id}` : 
      `userPersona-${persona.name.replace(/\s+/g, '-').toLowerCase()}-${persona.role.replace(/\s+/g, '-').toLowerCase()}`;
    
    return {
      id: stableId,
      type: 'userPersona',
      title: 'User Persona',
      content: '',
      position: STAGE1_NODE_DEFAULTS.userPersona.position,
      size: STAGE1_NODE_DEFAULTS.userPersona.size,
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: persona.name || 'User Persona',
      role: persona.role || 'Role',
      painPoint: persona.painPoint || 'Pain point',
      emoji: persona.emoji || '👤',
      editable: true,
      resizable: true
    };
  }

  private static createLegacyUserPersonaNode(targetUsers: string): CanvasNodeData {
    return {
      id: `userPersona-legacy-${targetUsers.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
      type: 'userPersona',
      title: 'User Persona',
      content: '',
      position: STAGE1_NODE_DEFAULTS.userPersona.position,
      size: STAGE1_NODE_DEFAULTS.userPersona.size,
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: 'Target User',
      role: 'Primary User',
      painPoint: targetUsers,
      emoji: '👤',
      editable: true,
      resizable: true
    };
  }

  private static createFeaturePackNode(
    pack: string, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    const packNames: { [key: string]: string } = {
      'auth': 'Authentication & Users',
      'crud': 'Data Management',
      'social': 'Social Features',
      'communication': 'Communication',
      'commerce': 'E-commerce',
      'analytics': 'Analytics & Reporting',
      'media': 'Media & Files',
      'ai': 'AI & Automation'
    };
    
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 180, height: 100 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `feature-pack-${pack}`,
      type: 'feature',
      title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
      content: `Feature pack selected\nIncludes core ${pack} functionality`,
      position: position,
      size: size,
      color: 'blue',
      connections: connections,
      metadata: { stage: 'feature-planning', pack, custom: false },
      resizable: true
    };
  }

  private static createCustomFeatureNode(
    feature: any, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 180, height: 120 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `feature-custom-${feature.id || this.nodeIdCounter++}`,
      type: 'feature',
      title: feature.name,
      content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
      position: position,
      size: size,
      color: 'blue',
      connections: connections,
      metadata: { stage: 'feature-planning', custom: true, featureId: feature.id },
      resizable: true
    };
  }

  private static createNaturalLanguageFeatureNode(
    naturalLanguageFeatures: string,
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 220, height: 140 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'feature-natural-language',
      type: 'feature',
      title: 'Feature Description',
      content: naturalLanguageFeatures,
      position: position,
      size: size,
      color: 'blue',
      connections: connections,
      metadata: { stage: 'feature-planning', type: 'description' },
      resizable: true
    };
  }

  private static createScreenNode(
    screen: any, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 150, height: 100 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `screen-${screen.id || this.nodeIdCounter++}`,
      type: 'ux-flow',
      title: screen.name,
      content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
      position: position,
      size: size,
      color: 'green',
      connections: connections,
      metadata: { stage: 'structure-flow', screenType: screen.type },
      resizable: true
    };
  }

  private static createUserFlowNode(
    flow: any, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 200, height: 120 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `flow-${flow.id || this.nodeIdCounter++}`,
      type: 'ux-flow',
      title: flow.name,
      content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
      position: position,
      size: size,
      color: 'green',
      connections: connections,
      metadata: { stage: 'structure-flow', flowType: 'user-journey' },
      resizable: true
    };
  }

  private static createDatabaseTableNode(
    table: any, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 180, height: 100 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `db-table-${table.id || this.nodeIdCounter++}`,
      type: 'system',
      title: `${table.name} Table`,
      content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'architecture-design', tableType: 'database' },
      resizable: true
    };
  }

  private static createAPIEndpointsNode(
    apiEndpoints: any[], 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 160, height: 80 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'api-endpoints',
      type: 'system',
      title: 'API Endpoints',
      content: `${apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'architecture-design', systemType: 'api' },
      resizable: true
    };
  }

  private static createRouteNode(
    route: any, 
    index: number, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 140, height: 90 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || `route-${route.id || this.nodeIdCounter++}`,
      type: 'system',
      title: `${route.path} Route`,
      content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`,
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'architecture-design', routeType: 'page' },
      resizable: true
    };
  }

  private static createDesignSystemNode(
    designSystem: string, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 160, height: 80 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'design-system',
      type: 'wireframe',
      title: 'Design System',
      content: `${designSystem}\n\nComponent library and styling approach`,
      position: position,
      size: size,
      color: 'purple',
      connections: connections,
      metadata: { stage: 'interface-interaction', uiType: 'design-system' },
      resizable: true
    };
  }

  private static createBrandingNode(
    branding: any, 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 140, height: 80 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'brand-colors',
      type: 'wireframe',
      title: 'Brand Colors',
      content: `Primary: ${branding.primaryColor}\nSecondary: ${branding.secondaryColor}\nFont: ${branding.fontFamily}`,
      position: position,
      size: size,
      color: 'purple',
      connections: connections,
      metadata: { stage: 'interface-interaction', uiType: 'branding' },
      resizable: true
    };
  }

  private static createLayoutNode(
    layoutBlocks: any[], 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 160, height: 80 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'layout-structure',
      type: 'wireframe',
      title: 'Layout Structure',
      content: `${layoutBlocks.length} layout blocks\n\n${layoutBlocks.map((block: any) => block.type).join(', ')}`,
      position: position,
      size: size,
      color: 'purple',
      connections: connections,
      metadata: { stage: 'interface-interaction', uiType: 'layout' },
      resizable: true
    };
  }

  private static createAuthMethodsNode(
    authMethods: any[], 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 180, height: 100 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'auth-methods',
      type: 'system',
      title: 'Auth Methods',
      content: `${authMethods.length} methods enabled\n\n${authMethods.map((m: any) => `• ${m.name}`).join('\n')}`,
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'user-auth-flow', authType: 'methods' },
      resizable: true
    };
  }

  private static createUserRolesNode(
    userRoles: any[], 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 180, height: 120 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'user-roles',
      type: 'system',
      title: 'User Roles',
      content: `${userRoles.length} roles defined\n\n${userRoles.map((r: any) => {
        const name = r?.name || 'Unnamed Role';
        const description = r?.description || '';
        // Add null check before using slice
        const truncatedDesc = description && typeof description === 'string' 
          ? description.slice(0, 20) + '...' 
          : 'No description';
        return `• ${name}: ${truncatedDesc}`;
      }).join('\n')}`,      
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'user-auth-flow', authType: 'roles' },
      resizable: true
    };
  }

  private static createSecurityFeaturesNode(
    securityFeatures: any[], 
    baseX: number, 
    baseY: number, 
    existingNode?: CanvasNodeData | null,
    stableId?: string
  ): CanvasNodeData {
    // Use existing position and size if available
    const position = existingNode?.position || { x: baseX, y: baseY };
    const size = existingNode?.size || { width: 200, height: 100 };
    const connections = existingNode?.connections || [];
    
    return {
      id: stableId || 'security-features',
      type: 'system',
      title: 'Security Features',
      content: `${securityFeatures.length} features enabled\n\n${securityFeatures.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n')}${securityFeatures.length > 4 ? '\n...' : ''}`,
      position: position,
      size: size,
      color: 'red',
      connections: connections,
      metadata: { stage: 'user-auth-flow', authType: 'security' },
      resizable: true
    };
  }

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