/**
 * nodeFactory.ts
 * 
 * Centralized factory for creating canvas nodes.
 * This utility provides consistent node creation logic that can be used
 * by both the CanvasDataProcessor and the SpatialCanvas components.
 */

import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from 'reactflow';
import { STAGE1_NODE_TYPES, STAGE1_NODE_DEFAULTS } from '../../components/canvas/customnodetypes/stage1nodes';
import { STAGE2_NODE_TYPES, STAGE2_NODE_DEFAULTS } from '../../components/canvas/customnodetypes/stage2nodes'; 
import { getSmartNodePosition } from './nodePlacementUtils';

// Node ID counter for generating unique IDs
let nodeIdCounter = 1;

/**
 * Create an app name node
 */
export function createAppNameNode(appName: string, existingNodes: Node[] = []): Node {
  const defaults = STAGE1_NODE_DEFAULTS.appName;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'appName',
    defaults.position
  );
  
  return {
    id: STAGE1_NODE_TYPES.APP_NAME,
    type: 'appName',
    position,
    data: {
      title: 'App Name',
      content: '',
      size: defaults.size,
      color: 'appName',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'appName' },
      value: appName,
      editable: true,
      nameHistory: [],
      resizable: true
    }
  };
}

/**
 * Create a tagline node
 */
export function createTaglineNode(tagline: string, existingNodes: Node[] = []): Node {
  const defaults = STAGE1_NODE_DEFAULTS.tagline;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'tagline',
    defaults.position
  );
  
  return {
    id: STAGE1_NODE_TYPES.TAGLINE,
    type: 'tagline',
    position,
    data: {
      title: 'Tagline',
      content: '',
      size: defaults.size,
      color: 'tagline',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'tagline' },
      value: tagline,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a core problem node
 */
export function createCoreProblemNode(problemStatement: string, existingNodes: Node[] = []): Node {
  const defaults = STAGE1_NODE_DEFAULTS.coreProblem;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'coreProblem',
    defaults.position
  );
  
  return {
    id: STAGE1_NODE_TYPES.CORE_PROBLEM,
    type: 'coreProblem',
    position,
    data: {
      title: 'Core Problem',
      content: '',
      size: defaults.size,
      color: 'coreProblem',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'coreProblem' },
      value: problemStatement,
      editable: true,
      keywords: [],
      resizable: true
    }
  };
}

/**
 * Create a mission node
 */
export function createMissionNode(
  appIdea: string, 
  missionStatement?: string, 
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.mission;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'mission',
    defaults.position
  );
  
  return {
    id: STAGE1_NODE_TYPES.MISSION,
    type: 'mission',
    position,
    data: {
      title: 'Mission',
      content: '',
      size: defaults.size,
      color: 'mission',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'mission' },
      value: appIdea,
      missionStatement: missionStatement || '',
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a value proposition node
 */
export function createValuePropNode(valueProposition: string, existingNodes: Node[] = []): Node {
  const defaults = STAGE1_NODE_DEFAULTS.valueProp;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'valueProp',
    defaults.position
  );
  
  return {
    id: STAGE1_NODE_TYPES.VALUE_PROPOSITION,
    type: 'valueProp',
    position,
    data: {
      title: 'Value Proposition',
      content: '',
      size: defaults.size,
      color: 'valueProp',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'valueProp' },
      value: valueProposition,
      editable: true,
      bulletPoints: [],
      resizable: true
    }
  };
}

/**
 * Create a user persona node
 */
export function createUserPersonaNode(
  persona: any, 
  index: number = 0, 
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.userPersona;
  
  // Calculate position with horizontal offset based on index
  const position = {
    x: defaults.position.x + (index * 180),
    y: defaults.position.y
  };
  const finalPosition = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'userPersona',
    position
  );
  
  return {
    id: uuidv4(),
    type: 'userPersona',
    position: finalPosition,
    data: {
      title: 'User Persona',
      content: '',
      size: defaults.size,
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: persona.name || 'User Persona',
      role: persona.role || 'Role',
      painPoint: persona.painPoint || 'Pain point',
      emoji: persona.emoji || '👤',
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a legacy user persona node
 */
export function createLegacyUserPersonaNode(
  targetUsers: string, 
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.userPersona;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'userPersona',
    defaults.position
  );
  
  return {
    id: uuidv4(),
    type: 'userPersona',
    position,
    data: {
      title: 'User Persona',
      content: '',
      size: defaults.size,
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: 'Target User',
      role: 'Primary User',
      painPoint: targetUsers,
      emoji: '👤',
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a competitor node
 */
export function createCompetitorNode(
  competitor: any, 
  index: number = 0,
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.competitor;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'competitor',
    defaults.position
  );
  
  return {
    id: uuidv4(),
    type: 'competitor',
    position,
    data: {
      title: 'Competitor',
      content: '',
      size: defaults.size,
      color: 'competitor',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'competitor' },
      name: competitor.name || '',
      notes: competitor.notes || '',
      link: competitor.link || '',
      domain: competitor.domain || '',
      tagline: competitor.tagline || '',
      features: competitor.features || [],
      pricingTiers: competitor.pricingTiers || [],
      marketPositioning: competitor.marketPositioning || '',
      strengths: competitor.strengths || [],
      weaknesses: competitor.weaknesses || [],
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a feature pack node
 */
export function createFeaturePackNode(
  pack: string, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: Node[] = []
): Node {
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
  
  const position = { 
    x: baseX + (index % 3) * 200, 
    y: baseY + Math.floor(index / 3) * 120 
  };
  const finalPosition = getSmartNodePosition(
    existingNodes,
    STAGE2_NODE_DEFAULTS.feature.size,
    'feature',
    position,
    'feature-planning'
  );
  
  return {
    id: uuidv4(),
    type: 'feature',
    position: finalPosition,
    data: {
      title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
      content: `Feature pack selected\nIncludes core ${pack} functionality`,
      size: STAGE2_NODE_DEFAULTS.feature.size,
      color: 'blue',
      connections: [],
      metadata: { 
        stage: 'feature-planning', 
        pack, 
        sourceId: pack,
        priority: 'should',
        complexity: 'medium'
      },
      subFeatures: [],
      showBreakdown: false,
      resizable: true
    }
  };
}

/**
 * Create a custom feature node
 */
export function createCustomFeatureNode(
  feature: any, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const position = { 
    x: baseX + (index % 3) * 200, 
    y: baseY + Math.floor(index / 3) * 120 
  };
  
  return {
    id: uuidv4(),
    type: 'feature',
    title: feature.name,
    content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
    position: getSmartNodePosition(
      existingNodes,
      STAGE2_NODE_DEFAULTS.feature.size,
      'feature',
      position,
      'feature-planning'
    ),
    size: STAGE2_NODE_DEFAULTS.feature.size,
    color: 'blue',
    connections: [],
    metadata: { 
      stage: 'feature-planning', 
      custom: true, 
      sourceId: feature.id,
      priority: feature.priority || 'should',
      complexity: feature.complexity || 'medium',
      category: feature.category || 'both'
    },
    subFeatures: feature.subFeatures || [],
    showBreakdown: false,
    resizable: true
  };
}

/**
 * Create a natural language feature node
 */
export function createNaturalLanguageFeatureNode(
  naturalLanguageFeatures: string,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'feature',
    title: 'Feature Description',
    content: naturalLanguageFeatures,
    position: getSmartNodePosition(
      existingNodes,
      STAGE2_NODE_DEFAULTS.feature.size,
      'feature',
      { x: 700, y: 350 },
      'feature-planning'
    ),
    size: STAGE2_NODE_DEFAULTS.feature.size,
    color: 'blue',
    connections: [],
    metadata: { stage: 'feature-planning', type: 'description' },
    resizable: true
  };
}

/**
 * Create an architecture node
 */
export function createArchitectureNode(
  architectureData: any,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const defaults = STAGE2_NODE_DEFAULTS.architecture;
  
  return {
    id: uuidv4(),
    type: 'architecture',
    title: 'Architecture Blueprint',
    content: `Architecture blueprint with ${architectureData.screens.length} screens, ${architectureData.apiRoutes.length} API routes, and ${architectureData.components.length} components.`,
    position: getSmartNodePosition(
      existingNodes,
      defaults.size,
      'architecture',
      defaults.position,
      'feature-planning'
    ),
    size: defaults.size,
    color: 'indigo',
    connections: [],
    metadata: { 
      stage: 'feature-planning',
      architectureData
    },
    resizable: true
  };
}

/**
 * Create a screen node
 */
export function createScreenNode(
  screen: any, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const position = { 
    x: baseX + (index % 4) * 160, 
    y: baseY 
  };
  
  return {
    id: uuidv4(),
    type: 'ux-flow',
    title: screen.name,
    content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 150, height: 100 },
      'ux-flow',
      position,
      'structure-flow'
    ),
    size: { width: 150, height: 100 },
    color: 'green',
    connections: [],
    metadata: { stage: 'structure-flow', screenType: screen.type, sourceId: screen.id },
    resizable: true
  };
}

/**
 * Create a user flow node
 */
export function createUserFlowNode(
  flow: any, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const position = { 
    x: baseX + (index % 3) * 220, 
    y: baseY + 120 
  };
  
  return {
    id: uuidv4(),
    type: 'ux-flow',
    title: flow.name,
    content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 200, height: 120 },
      'ux-flow',
      position,
      'structure-flow'
    ),
    size: { width: 200, height: 120 },
    color: 'green',
    connections: [],
    metadata: { stage: 'structure-flow', flowType: 'user-journey', sourceId: flow.id },
    resizable: true
  };
}

/**
 * Create a database table node
 */
export function createDatabaseTableNode(
  table: any, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const position = { 
    x: baseX + (index % 3) * 200, 
    y: baseY 
  };
  
  return {
    id: uuidv4(),
    type: 'system',
    title: `${table.name} Table`,
    content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 180, height: 100 },
      'system',
      position,
      'architecture-design'
    ),
    size: { width: 180, height: 100 },
    color: 'red',
    connections: [],
    metadata: { stage: 'architecture-design', tableType: 'database', sourceId: table.id },
    resizable: true
  };
}

/**
 * Create an API endpoints node
 */
export function createAPIEndpointsNode(
  apiEndpoints: any[], 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'system',
    title: 'API Endpoints',
    content: `${apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 160, height: 80 },
      'system',
      { x: baseX + 400, y: baseY },
      'architecture-design'
    ),
    size: { width: 160, height: 80 },
    color: 'red',
    connections: [],
    metadata: { stage: 'architecture-design', systemType: 'api' },
    resizable: true
  };
}

/**
 * Create a route node
 */
export function createRouteNode(
  route: any, 
  index: number, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  const position = { 
    x: baseX + (index % 4) * 150, 
    y: baseY + 120 
  };
  
  return {
    id: uuidv4(),
    type: 'system',
    title: `${route.path} Route`,
    content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 140, height: 90 },
      'system',
      position,
      'architecture-design'
    ),
    size: { width: 140, height: 90 },
    color: 'red',
    connections: [],
    metadata: { stage: 'architecture-design', routeType: 'page', sourceId: route.id },
    resizable: true
  };
}

/**
 * Create a design system node
 */
export function createDesignSystemNode(
  designSystem: string, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'wireframe',
    title: 'Design System',
    content: `${designSystem}\n\nComponent library and styling approach`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 160, height: 80 },
      'wireframe',
      { x: baseX, y: baseY },
      'interface-interaction'
    ),
    size: { width: 160, height: 80 },
    color: 'purple',
    connections: [],
    metadata: { stage: 'interface-interaction', uiType: 'design-system' },
    resizable: true
  };
}

/**
 * Create a branding node
 */
export function createBrandingNode(
  branding: any, 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'wireframe',
    title: 'Brand Colors',
    content: `Primary: ${branding.primaryColor}\nSecondary: ${branding.secondaryColor}\nFont: ${branding.fontFamily}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 140, height: 80 },
      'wireframe',
      { x: baseX + 180, y: baseY },
      'interface-interaction'
    ),
    size: { width: 140, height: 80 },
    color: 'purple',
    connections: [],
    metadata: { stage: 'interface-interaction', uiType: 'branding' },
    resizable: true
  };
}

/**
 * Create a layout node
 */
export function createLayoutNode(
  layoutBlocks: any[], 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'wireframe',
    title: 'Layout Structure',
    content: `${layoutBlocks.length} layout blocks\n\n${layoutBlocks.map((block: any) => block.type).join(', ')}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 160, height: 80 },
      'wireframe',
      { x: baseX + 340, y: baseY },
      'interface-interaction'
    ),
    size: { width: 160, height: 80 },
    color: 'purple',
    connections: [],
    metadata: { stage: 'interface-interaction', uiType: 'layout' },
    resizable: true
  };
}

/**
 * Create an auth methods node
 */
export function createAuthMethodsNode(
  authMethods: any[], 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'system',
    title: 'Auth Methods',
    content: `${authMethods.length} methods enabled\n\n${authMethods.map((m: any) => `• ${m.name}`).join('\n')}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 180, height: 100 },
      'system',
      { x: baseX, y: baseY },
      'user-auth-flow'
    ),
    size: { width: 180, height: 100 },
    color: 'red',
    connections: [],
    metadata: { stage: 'user-auth-flow', authType: 'methods' },
    resizable: true
  };
}

/**
 * Create a user roles node
 */
export function createUserRolesNode(
  userRoles: any[], 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
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
    position: getSmartNodePosition(
      existingNodes,
      { width: 180, height: 120 },
      'system',
      { x: baseX + 200, y: baseY },
      'user-auth-flow'
    ),
    size: { width: 180, height: 120 },
    color: 'red',
    connections: [],
    metadata: { stage: 'user-auth-flow', authType: 'roles' },
    resizable: true
  };
}

/**
 * Create a security features node
 */
export function createSecurityFeaturesNode(
  securityFeatures: any[], 
  baseX: number, 
  baseY: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData {
  return {
    id: uuidv4(),
    type: 'system',
    title: 'Security Features',
    content: `${securityFeatures.length} features enabled\n\n${securityFeatures.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n')}${securityFeatures.length > 4 ? '\n...' : ''}`,
    position: getSmartNodePosition(
      existingNodes,
      { width: 200, height: 100 },
      'system',
      { x: baseX, y: baseY + 120 },
      'user-auth-flow'
    ),
    size: { width: 200, height: 100 },
    color: 'red',
    connections: [],
    metadata: { stage: 'user-auth-flow', authType: 'security' },
    resizable: true
  };
}

/**
 * Create an AI analysis node
 */
export function createAIAnalysisNode(
  stageData: any, 
  nodeCount: number,
  existingNodes: CanvasNodeData[] = []
): CanvasNodeData | null {
  if (nodeCount === 0) {
    return null; // Don't create analysis node for empty canvas
  }
  
  // Generate AI analysis based on project completeness
  const completedStages = Object.keys(stageData).length;
  if (completedStages === 0) return null;

  // Calculate the total number of items across all stages
  const totalItems = Object.values(stageData).reduce((count: number, stageItems: any) => {
    return count + Object.keys(stageItems || {}).length;
  }, 0);

  // Get app name from ideation stage if available
  const appName = stageData['ideation-discovery']?.appName || 'Your app';
  
  // Get feature count from feature planning stage if available
  const featureCount = (stageData['feature-planning']?.selectedFeaturePacks?.length || 0) + 
                      (stageData['feature-planning']?.customFeatures?.length || 0);
  
  // Get screen count from structure flow stage if available
  const screenCount = stageData['structure-flow']?.screens?.length || 0;
  
  // Get database table count from architecture design stage if available
  const tableCount = stageData['architecture-design']?.databaseSchema?.length || 0;
  
  // Generate content based on available data
  let content = `Project Analysis for ${appName}\n\n`;
  content += `• ${completedStages} stages with data\n`;
  content += `• ${totalItems} total items defined\n`;
  
  if (featureCount > 0) {
    content += `• ${featureCount} features planned\n`;
  }
  
  if (screenCount > 0) {
    content += `• ${screenCount} screens designed\n`;
  }
  
  if (tableCount > 0) {
    content += `• ${tableCount} database tables\n`;
  }
  
  // Add recommendations based on project state
  content += "\nRecommendations:\n";
  
  if (!stageData['ideation-discovery']?.valueProposition) {
    content += "• Define your value proposition\n";
  }
  
  if (!stageData['feature-planning'] || featureCount === 0) {
    content += "• Plan your core features\n";
  }
  
  if (!stageData['structure-flow'] || screenCount === 0) {
    content += "• Design your app screens\n";
  }
  
  if (!stageData['architecture-design'] || tableCount === 0) {
    content += "• Define your data models\n";
  }

  return {
    id: uuidv4(),
    type: 'agent-output',
    title: 'AI Analysis',
    content,
    position: getSmartNodePosition(
      existingNodes,
      { width: 220, height: 180 },
      'agent-output',
      { x: 100 + (nodeCount * 10), y: 100 + (nodeCount * 10) }
    ),
    size: { width: 220, height: 180 },
    color: 'gray',
    connections: [],
    metadata: {
      generated: true,
      stagesCompleted: completedStages,
      totalNodes: nodeCount,
      timestamp: new Date().toISOString()
    },
    resizable: true
  };
}

/**
 * Create a platform node
 */
export function createPlatformNode(
  platform: string,
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 160, height: 80 },
    'platform',
    { x: 400, y: 300 },
    'ideation-discovery'
  );
  
  return {
    id: uuidv4(),
    type: 'platform',
    position,
    data: {
      title: 'Platform',
      content: '',
      size: { width: 160, height: 80 },
      color: 'blue',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'platform' },
      platform: platform,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a tech stack node
 */
export function createTechStackNode(
  techStack: string[],
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 180, height: 120 },
    'techStack',
    { x: 500, y: 400 },
    'ideation-discovery'
  );
  
  return {
    id: uuidv4(),
    type: 'techStack',
    position,
    data: {
      title: 'Tech Stack',
      content: '',
      size: { width: 180, height: 120 },
      color: 'indigo',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'techStack' },
      techStack: techStack,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a UI style node
 */
export function createUIStyleNode(
  uiStyle: string,
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 180, height: 120 },
    'uiStyle',
    { x: 300, y: 400 },
    'ideation-discovery'
  );
  
  return {
    id: uuidv4(),
    type: 'uiStyle',
    position,
    data: {
      title: 'UI Style',
      content: '',
      size: { width: 180, height: 120 },
      color: 'pink',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'uiStyle' },
      uiStyle: uiStyle,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Reset the node ID counter
 * Useful for testing or when clearing the canvas
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 1;
}

/**
 * Get the current node ID counter value
 * Useful for debugging or synchronizing with other components
 */
export function getNodeIdCounter(): number {
  return nodeIdCounter;
}