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

export interface ProcessorState {
  nodes: CanvasNodeData[];
  lastProcessedData: { [key: string]: any };
}

export class CanvasDataProcessor {
  private static nodeIdCounter = 1;

  /**
   * Main processing function - transforms stage data into canvas nodes
   * This is the heart of the spatial canvas system
   */
  static updateCanvasFromStageData(
    stageData: any,
    currentState: ProcessorState,
    onStateUpdate: (newState: ProcessorState) => void
  ): void {
    // Check what data has changed and only add new nodes
    const currentDataHash = JSON.stringify(stageData);
    const lastDataHash = JSON.stringify(currentState.lastProcessedData);
    
    if (currentDataHash === lastDataHash) {
      return; // No changes, don't update
    }

    let newNodes: CanvasNodeData[] = [];
    
    // Process each stage's data
    newNodes = [
      ...this.processIdeationData(stageData, currentState),
      ...this.processFeatureData(stageData, currentState),
      ...this.processStructureData(stageData, currentState),
      ...this.processArchitectureData(stageData, currentState),
      ...this.processInterfaceData(stageData, currentState),
      ...this.processAuthData(stageData, currentState),
    ];

    // Generate AI analysis node
    const aiAnalysisNode = this.generateAIAnalysisNode(stageData, currentState.nodes.length + newNodes.length);
    if (aiAnalysisNode) {
      newNodes.push(aiAnalysisNode);
    }

    // Update state with new nodes
    if (newNodes.length > 0) {
      const updatedState: ProcessorState = {
        nodes: [...currentState.nodes, ...newNodes],
        lastProcessedData: { ...stageData }
      };
      onStateUpdate(updatedState);
    } else {
      // Update last processed data even if no new nodes
      onStateUpdate({
        ...currentState,
        lastProcessedData: { ...stageData }
      });
    }
  }

  /**
   * Process ideation discovery data into custom stage 1 nodes
   */
  private static processIdeationData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const ideationData = stageData['ideation-discovery'];
    const lastIdeationData = currentState.lastProcessedData['ideation-discovery'] || {};
    
    if (!ideationData || JSON.stringify(ideationData) === JSON.stringify(lastIdeationData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];

    // Only replace specific singleton nodes (like app name), not all ideation nodes
    const existingAppNameNode = currentState.nodes.find(node => node.id === STAGE1_NODE_TYPES.APP_NAME);
    const existingTaglineNode = currentState.nodes.find(node => node.id === STAGE1_NODE_TYPES.TAGLINE);
    const existingCoreProblemNode = currentState.nodes.find(node => node.id === STAGE1_NODE_TYPES.CORE_PROBLEM);
    const existingMissionNode = currentState.nodes.find(node => node.id === STAGE1_NODE_TYPES.MISSION);
    const existingValuePropNode = currentState.nodes.find(node => node.id === STAGE1_NODE_TYPES.VALUE_PROPOSITION);

    // Create or update singleton nodes (these should replace existing ones)
    if (ideationData.appName && (!existingAppNameNode || existingAppNameNode.value !== ideationData.appName)) {
      newNodes.push(this.createAppNameNode(ideationData.appName));
    }

    if (ideationData.tagline && (!existingTaglineNode || existingTaglineNode.value !== ideationData.tagline)) {
      newNodes.push(this.createTaglineNode(ideationData.tagline));
    }

    if (ideationData.problemStatement && (!existingCoreProblemNode || existingCoreProblemNode.value !== ideationData.problemStatement)) {
      newNodes.push(this.createCoreProblemNode(ideationData.problemStatement));
    }

    if (ideationData.appIdea && (!existingMissionNode || existingMissionNode.value !== ideationData.appIdea)) {
      newNodes.push(this.createMissionNode(ideationData.appIdea));
    }

    if (ideationData.valueProposition && (!existingValuePropNode || existingValuePropNode.value !== ideationData.valueProposition)) {
      newNodes.push(this.createValuePropNode(ideationData.valueProposition));
    }

    // For multi-instance nodes like user personas, only add new ones
    if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
      const existingPersonas = currentState.nodes.filter(node => 
        node.metadata?.stage === 'ideation-discovery' && node.metadata?.nodeType === 'userPersona'
      );
    
      // Only add personas that don't already exist
      ideationData.userPersonas.forEach((persona: any, index: number) => {
        const personaExists = existingPersonas.some(existing => 
          existing.name === persona.name && existing.role === persona.role
        );
      
        if (!personaExists) {
          newNodes.push(this.createUserPersonaNode(persona, index));
        }
      });
    } else if (ideationData.targetUsers && !ideationData.userPersonas) {
      // Check if legacy persona already exists
      const legacyPersonaExists = currentState.nodes.some(node => 
        node.metadata?.stage === 'ideation-discovery' && 
        node.metadata?.nodeType === 'userPersona' &&
        node.painPoint === ideationData.targetUsers
      );
    
      if (!legacyPersonaExists) {
        newNodes.push(this.createLegacyUserPersonaNode(ideationData.targetUsers));
      }
    }

    return newNodes;
  }

  /**
   * Process feature planning data into feature nodes
   */
  private static processFeatureData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const featureData = stageData['feature-planning'];
    const lastFeatureData = currentState.lastProcessedData['feature-planning'] || {};
    
    if (!featureData || JSON.stringify(featureData) === JSON.stringify(lastFeatureData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];
    let featureX = 100;
    let featureY = 350;

    // Remove old feature nodes
    const filteredNodes = currentState.nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'feature-planning'
    );

    // Process selected feature packs
    if (featureData.selectedFeaturePacks) {
      featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
        newNodes.push(this.createFeaturePackNode(pack, index, featureX, featureY));
      });
    }

    // Process custom features
    if (featureData.customFeatures) {
      const startIndex = featureData.selectedFeaturePacks?.length || 0;
      featureData.customFeatures.forEach((feature: any, index: number) => {
        newNodes.push(this.createCustomFeatureNode(feature, startIndex + index, featureX, featureY));
      });
    }

    // Add natural language features if provided
    if (featureData.naturalLanguageFeatures) {
      newNodes.push(this.createNaturalLanguageFeatureNode(featureData.naturalLanguageFeatures));
    }

    return newNodes;
  }

  /**
   * Process structure flow data into UX flow nodes
   */
  private static processStructureData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const structureData = stageData['structure-flow'];
    const lastStructureData = currentState.lastProcessedData['structure-flow'] || {};
    
    if (!structureData || JSON.stringify(structureData) === JSON.stringify(lastStructureData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];
    let flowX = 100;
    let flowY = 600;

    // Remove old structure nodes
    const filteredNodes = currentState.nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'structure-flow'
    );

    // Process screens
    if (structureData.screens) {
      structureData.screens.forEach((screen: any, index: number) => {
        newNodes.push(this.createScreenNode(screen, index, flowX, flowY));
      });
    }

    // Process user flows
    if (structureData.userFlows) {
      structureData.userFlows.forEach((flow: any, index: number) => {
        newNodes.push(this.createUserFlowNode(flow, index, flowX, flowY));
      });
    }

    return newNodes;
  }

  /**
   * Process architecture data into system nodes
   */
  private static processArchitectureData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const architectureData = stageData['architecture-design'];
    const lastArchitectureData = currentState.lastProcessedData['architecture-design'] || {};
    
    if (!architectureData || JSON.stringify(architectureData) === JSON.stringify(lastArchitectureData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];
    let systemX = 100;
    let systemY = 800;

    // Remove old architecture nodes
    const filteredNodes = currentState.nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'architecture-design'
    );

    // Process database schema
    if (architectureData.databaseSchema) {
      architectureData.databaseSchema.forEach((table: any, index: number) => {
        newNodes.push(this.createDatabaseTableNode(table, index, systemX, systemY));
      });
    }

    // Process API endpoints
    if (architectureData.apiEndpoints) {
      newNodes.push(this.createAPIEndpointsNode(architectureData.apiEndpoints, systemX, systemY));
    }

    // Process other architecture components
    if (architectureData.sitemap) {
      architectureData.sitemap.forEach((route: any, index: number) => {
        newNodes.push(this.createRouteNode(route, index, systemX, systemY));
      });
    }

    return newNodes;
  }

  /**
   * Process interface data into UI nodes
   */
  private static processInterfaceData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const interfaceData = stageData['interface-interaction'] || {};
    const lastInterfaceData = currentState.lastProcessedData['interface-interaction'] || {};
    
    if (!interfaceData || JSON.stringify(interfaceData) === JSON.stringify(lastInterfaceData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];
    let uiX = 100;
    let uiY = 1000;

    // Remove old interface nodes
    const filteredNodes = currentState.nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'interface-interaction'
    );

    // Process design system
    if (interfaceData.selectedDesignSystem) {
      newNodes.push(this.createDesignSystemNode(interfaceData.selectedDesignSystem, uiX, uiY));
    }

    // Process custom branding
    if (interfaceData.customBranding) {
      newNodes.push(this.createBrandingNode(interfaceData.customBranding, uiX, uiY));
    }

    // Process layout blocks
    if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
      newNodes.push(this.createLayoutNode(interfaceData.layoutBlocks, uiX, uiY));
    }

    return newNodes;
  }

  /**
   * Process auth data into security nodes
   */
  private static processAuthData(stageData: any, currentState: ProcessorState): CanvasNodeData[] {
    const authData = stageData['user-auth-flow'] || {};
    const lastAuthData = currentState.lastProcessedData['user-auth-flow'] || {};
    
    if (!authData || JSON.stringify(authData) === JSON.stringify(lastAuthData)) {
      return [];
    }

    const newNodes: CanvasNodeData[] = [];
    let authX = 100;
    let authY = 1200;

    // Remove old auth nodes
    const filteredNodes = currentState.nodes.filter(node => 
      !node.metadata?.stage || node.metadata.stage !== 'user-auth-flow'
    );

    // Process authentication methods
    if (authData.authMethods) {
      const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
      if (enabledMethods.length > 0) {
        newNodes.push(this.createAuthMethodsNode(enabledMethods, authX, authY));
      }
    }

    // Process user roles
    if (authData.userRoles && authData.userRoles.length > 0) {
      newNodes.push(this.createUserRolesNode(authData.userRoles, authX, authY));
    }

    // Process security features
    if (authData.securityFeatures) {
      const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
      if (enabledSecurity.length > 0) {
        newNodes.push(this.createSecurityFeaturesNode(enabledSecurity, authX, authY));
      }
    }

    return newNodes;
  }

  /**
   * Generate AI analysis node based on project completeness
   */
  private static generateAIAnalysisNode(stageData: any, totalNodes: number): CanvasNodeData | null {
    if (totalNodes === 0) return null;

    const completedStages = Object.keys(stageData).length;
    
    return {
      id: `agent-output-${this.nodeIdCounter++}`,
      type: 'agent-output',
      title: 'AI Analysis',
      content: `Project Analysis:\n\n• ${totalNodes} components mapped\n• ${completedStages} stages with data\n• Ready for ${completedStages < 3 ? 'more planning' : 'development'}`,
      position: { x: 750, y: 100 },
      size: { width: 200, height: 120 },
      color: 'gray',
      connections: [],
      metadata: { 
        generated: true, 
        timestamp: new Date().toISOString(),
        stagesCompleted: completedStages,
        totalNodes: totalNodes
      }
    };
  }

  // Node creation helper methods
  private static createAppNameNode(appName: string): CanvasNodeData {
    return {
      id: STAGE1_NODE_TYPES.APP_NAME,
      type: 'appName',
      title: 'App Name',
      content: '',
      position: STAGE1_NODE_DEFAULTS.appName.position,
      size: STAGE1_NODE_DEFAULTS.appName.size,
      color: 'appName',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'appName' },
      value: appName,
      editable: true,
      nameHistory: [],
      resizable: true
    };
  }

  private static createTaglineNode(tagline: string): CanvasNodeData {
    return {
      id: STAGE1_NODE_TYPES.TAGLINE,
      type: 'tagline',
      title: 'Tagline',
      content: '',
      position: STAGE1_NODE_DEFAULTS.tagline.position,
      size: STAGE1_NODE_DEFAULTS.tagline.size,
      color: 'tagline',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'tagline' },
      value: tagline,
      editable: true,
      resizable: true
    };
  }

  private static createCoreProblemNode(problemStatement: string): CanvasNodeData {
    return {
      id: STAGE1_NODE_TYPES.CORE_PROBLEM,
      type: 'coreProblem',
      title: 'Core Problem',
      content: '',
      position: STAGE1_NODE_DEFAULTS.coreProblem.position,
      size: STAGE1_NODE_DEFAULTS.coreProblem.size,
      color: 'coreProblem',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'coreProblem' },
      value: problemStatement,
      editable: true,
      keywords: [],
      resizable: true
    };
  }

  private static createMissionNode(appIdea: string): CanvasNodeData {
    return {
      id: STAGE1_NODE_TYPES.MISSION,
      type: 'mission',
      title: 'Mission',
      content: '',
      position: STAGE1_NODE_DEFAULTS.mission.position,
      size: STAGE1_NODE_DEFAULTS.mission.size,
      color: 'mission',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'mission' },
      value: appIdea,
      editable: true,
      resizable: true
    };
  }

  private static createValuePropNode(valueProposition: string): CanvasNodeData {
    return {
      id: STAGE1_NODE_TYPES.VALUE_PROPOSITION,
      type: 'valueProp',
      title: 'Value Proposition',
      content: '',
      position: STAGE1_NODE_DEFAULTS.valueProp.position,
      size: STAGE1_NODE_DEFAULTS.valueProp.size,
      color: 'valueProp',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'valueProp' },
      value: valueProposition,
      editable: true,
      bulletPoints: [],
      resizable: true
    };
  }

  private static createUserPersonaNode(persona: any, index: number): CanvasNodeData {
    return {
      id: `userPersona-${Date.now()}-${index}`,
      type: 'userPersona',
      title: 'User Persona',
      content: '',
      position: { 
        x: STAGE1_NODE_DEFAULTS.userPersona.position.x + (index * 180), 
        y: STAGE1_NODE_DEFAULTS.userPersona.position.y 
      },
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
      id: `userPersona-${Date.now()}`,
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

  private static createFeaturePackNode(pack: string, index: number, baseX: number, baseY: number): CanvasNodeData {
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
    
    return {
      id: `feature-${this.nodeIdCounter++}`,
      type: 'feature',
      title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
      content: `Feature pack selected\nIncludes core ${pack} functionality`,
      position: { x: baseX + (index % 3) * 200, y: baseY + Math.floor(index / 3) * 120 },
      size: { width: 180, height: 100 },
      color: 'blue',
      connections: [],
      metadata: { stage: 'feature-planning', pack },
      resizable: true
    };
  }

  private static createCustomFeatureNode(feature: any, index: number, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `feature-${this.nodeIdCounter++}`,
      type: 'feature',
      title: feature.name,
      content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
      position: { 
        x: baseX + (index % 3) * 200, 
        y: baseY + Math.floor(index / 3) * 120 
      },
      size: { width: 180, height: 120 },
      color: 'blue',
      connections: [],
      metadata: { stage: 'feature-planning', custom: true },
      resizable: true
    };
  }

  private static createNaturalLanguageFeatureNode(naturalLanguageFeatures: string): CanvasNodeData {
    return {
      id: `feature-${this.nodeIdCounter++}`,
      type: 'feature',
      title: 'Feature Description',
      content: naturalLanguageFeatures,
      position: { x: 700, y: 350 },
      size: { width: 220, height: 140 },
      color: 'blue',
      connections: [],
      metadata: { stage: 'feature-planning', type: 'description' },
      resizable: true
    };
  }

  private static createScreenNode(screen: any, index: number, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `ux-flow-${this.nodeIdCounter++}`,
      type: 'ux-flow',
      title: screen.name,
      content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
      position: { x: baseX + (index % 4) * 160, y: baseY },
      size: { width: 150, height: 100 },
      color: 'green',
      connections: [],
      metadata: { stage: 'structure-flow', screenType: screen.type },
      resizable: true
    };
  }

  private static createUserFlowNode(flow: any, index: number, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `ux-flow-${this.nodeIdCounter++}`,
      type: 'ux-flow',
      title: flow.name,
      content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
      position: { x: baseX + (index % 3) * 220, y: baseY + 120 },
      size: { width: 200, height: 120 },
      color: 'green',
      connections: [],
      metadata: { stage: 'structure-flow', flowType: 'user-journey' },
      resizable: true
    };
  }

  private static createDatabaseTableNode(table: any, index: number, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `system-${this.nodeIdCounter++}`,
      type: 'system',
      title: `${table.name} Table`,
      content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
      position: { x: baseX + (index % 3) * 200, y: baseY },
      size: { width: 180, height: 100 },
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', tableType: 'database' },
      resizable: true
    };
  }

  private static createAPIEndpointsNode(apiEndpoints: any[], baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `system-${this.nodeIdCounter++}`,
      type: 'system',
      title: 'API Endpoints',
      content: `${apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
      position: { x: baseX + 400, y: baseY },
      size: { width: 160, height: 80 },
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', systemType: 'api' },
      resizable: true
    };
  }

  private static createRouteNode(route: any, index: number, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `system-${this.nodeIdCounter++}`,
      type: 'system',
      title: `${route.path} Route`,
      content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`,
      position: { x: baseX + (index % 4) * 150, y: baseY + 120 },
      size: { width: 140, height: 90 },
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', routeType: 'page' },
      resizable: true
    };
  }

  private static createDesignSystemNode(designSystem: string, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `ui-${this.nodeIdCounter++}`,
      type: 'wireframe',
      title: 'Design System',
      content: `${designSystem}\n\nComponent library and styling approach`,
      position: { x: baseX, y: baseY },
      size: { width: 160, height: 80 },
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', uiType: 'design-system' },
      resizable: true
    };
  }

  private static createBrandingNode(branding: any, baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `ui-${this.nodeIdCounter++}`,
      type: 'wireframe',
      title: 'Brand Colors',
      content: `Primary: ${branding.primaryColor}\nSecondary: ${branding.secondaryColor}\nFont: ${branding.fontFamily}`,
      position: { x: baseX + 180, y: baseY },
      size: { width: 140, height: 80 },
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', uiType: 'branding' },
      resizable: true
    };
  }

  private static createLayoutNode(layoutBlocks: any[], baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `ui-${this.nodeIdCounter++}`,
      type: 'wireframe',
      title: 'Layout Structure',
      content: `${layoutBlocks.length} layout blocks\n\n${layoutBlocks.map((block: any) => block.type).join(', ')}`,
      position: { x: baseX + 340, y: baseY },
      size: { width: 160, height: 80 },
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', uiType: 'layout' },
      resizable: true
    };
  }

  private static createAuthMethodsNode(authMethods: any[], baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `auth-${this.nodeIdCounter++}`,
      type: 'system',
      title: 'Auth Methods',
      content: `${authMethods.length} methods enabled\n\n${authMethods.map((m: any) => `• ${m.name}`).join('\n')}`,
      position: { x: baseX, y: baseY },
      size: { width: 180, height: 100 },
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'methods' },
      resizable: true
    };
  }

  private static createUserRolesNode(userRoles: any[], baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `auth-${this.nodeIdCounter++}`,
      type: 'system',
      title: 'User Roles',
      content: `${userRoles.length} roles defined\n\n${userRoles.map((r: any) => `• ${r.name}: ${r.description.slice(0, 20)}...`).join('\n')}`,
      position: { x: baseX + 200, y: baseY },
      size: { width: 180, height: 120 },
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'roles' },
      resizable: true
    };
  }

  private static createSecurityFeaturesNode(securityFeatures: any[], baseX: number, baseY: number): CanvasNodeData {
    return {
      id: `auth-${this.nodeIdCounter++}`,
      type: 'system',
      title: 'Security Features',
      content: `${securityFeatures.length} features enabled\n\n${securityFeatures.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n')}${securityFeatures.length > 4 ? '\n...' : ''}`,
      position: { x: baseX, y: baseY + 120 },
      size: { width: 200, height: 100 },
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'security' },
      resizable: true
    };
  }
}