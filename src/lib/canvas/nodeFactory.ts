/**
 * nodeFactory.ts
 * 
 * Centralized factory for creating canvas nodes.
 * This utility provides consistent node creation logic that can be used
 * by both the CanvasDataProcessor and the SpatialCanvas components.
 */

import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from 'reactflow';
import { getSmartNodePosition } from './nodePlacementUtils';
import { MarkerType } from 'reactflow';

// Define constants for node types
export const STAGE1_NODE_TYPES = {
  APP_NAME: 'appName',
  TAGLINE: 'tagline',
  CORE_PROBLEM: 'coreProblem',
  MISSION: 'mission',
  USER_PERSONA: 'userPersona',
  VALUE_PROPOSITION: 'valueProp',
  COMPETITOR: 'competitor', 
  TECH_STACK: 'techStack',
  UI_STYLE: 'uiStyle',
  PLATFORM: 'platform',
  BRANDING: 'branding'
};

export const STAGE2_NODE_TYPES = { 
  FEATURE: 'feature',
  ARCHITECTURE: 'architecture',
  ROUTE_API_MAPPING: 'routeApiMapping',
};

export const STAGE3_NODE_TYPES = {
  INFORMATION_ARCHITECTURE: 'informationArchitecture',
  USER_JOURNEY: 'userJourney',
  STATE_DATA_FLOW: 'stateDataFlow', 
  MARKDOWN_CODE: 'markdownCode',
  LOFI_LAYOUT: 'lofiLayout',
};

// Define default node configurations
const STAGE1_NODE_DEFAULTS = {
  appName: {
    size: { width: 275, height: 80 },
    position: { x: 100, y: 100 }, // Match SEMANTIC_ZONES
    editable: true,
  },
  tagline: {
    size: { width: 240, height: 40 },
    position: { x: 100, y: 160 }, // Match SEMANTIC_ZONES (moved up)
    editable: true,
  },
  coreProblem: {
    size: { width: 110, height: 160 },
    position: { x: 100, y: 280 }, // Match SEMANTIC_ZONES (more spacing)
    editable: true,
  },
  mission: {
    size: { width: 175, height: 140 },
    position: { x: 100, y: 420 }, // Match SEMANTIC_ZONES (more spacing)
    editable: true,
  },
  valueProp: {
    size: { width: 120, height: 180 },
    position: { x: 100, y: 560 }, // Match SEMANTIC_ZONES (more spacing)
    editable: true,
  },
  userPersona: {
    size: { width: 95, height: 140 },
    position: { x: 450, y: 150 }, // Match SEMANTIC_ZONES (grid base)
    editable: true,
  },
  competitor: {
    size: { width: 140, height: 100 },
    position: { x: 450, y: 400 }, // Match SEMANTIC_ZONES (grid base)
    editable: true,
  },
  // Technical specs - bottom area
  platform: {
    size: { width: 160, height: 80 },
    position: { x: 100, y: 700 }, // Match SEMANTIC_ZONES
    editable: true,
  },
  techStack: {
    size: { width: 75, height: 120 },
    position: { x: 300, y: 700 }, // Match SEMANTIC_ZONES
    editable: true,
  },
  uiStyle: {
    size: { width: 115, height: 120 },
    position: { x: 500, y: 700 }, // Match SEMANTIC_ZONES
    editable: true,
  },
  branding: {
    size: { width: 280, height: 240 },
    position: { x: 700, y: 100 }, // Separate area for branding
    editable: true,
  }
};

export const STAGE2_NODE_DEFAULTS = {
  'feature': {
    size: { width: 500, height: 160 },
    position: { x: 800, y: 150 }, // Match SEMANTIC_ZONES (much further right)
    editable: true
  },
  'architecture': {
    size: { width: 400, height: 300 },
    position: { x: 1200, y: 400 }, // Match SEMANTIC_ZONES system area
    editable: true
  },
  'routeApiMapping': {
    size: { width: 350, height: 300 },
    position: { x: 1200, y: 200 }, // Match SEMANTIC_ZONES system area
    editable: true
  },
};

export const STAGE3_NODE_DEFAULTS = {
  'informationArchitecture': {
    size: { width: 350, height: 300 },
    position: { x: 1200, y: 200 }, // Match SEMANTIC_ZONES ux-flow area
    editable: true,
  },
  'userJourney': {
    size: { width: 400, height: 300 },
    position: { x: 1200, y: 400 }, // Match SEMANTIC_ZONES system area
    editable: true,
  },
  'stateDataFlow': {
    size: { width: 350, height: 300 },
    position: { x: 1200, y: 600 }, // Match SEMANTIC_ZONES wireframe area
    editable: true,   
  },
  'markdownCode': {
    size: { width: 400, height: 300 },
    position: { x: 1400, y: 200 }, // Further right for code blocks
    editable: true,   
  },
  'lofiLayout': {
    size: { width: 400, height: 300 },
    position: { x: 800, y: 500 }, // Match SEMANTIC_ZONES lofiLayout
    editable: true,
  },
};

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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'App Name',
      content: '',
      color: 'appName',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'appName' },
      value: appName,
      editable: true,
      nameHistory: [],
      width: defaults.size.width,
      height: defaults.size.height,
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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Tagline',
      content: '',
      color: 'tagline',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'tagline' },
      value: tagline,
      editable: true,
      width: defaults.size.width,
      height: defaults.size.height,
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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Core Problem',
      content: '',
      color: 'coreProblem',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'coreProblem' },
      value: problemStatement,
      editable: true,
      keywords: [],
      width: defaults.size.width,
      height: defaults.size.height,
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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Mission',
      content: '',
      color: 'mission',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'mission' },
      value: appIdea,
      missionStatement: missionStatement || '',
      editable: true,
      width: defaults.size.width,
      height: defaults.size.height,
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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Value Proposition',
      content: '',
      color: 'valueProp',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'valueProp' },
      value: valueProposition,
      editable: true,
      bulletPoints: [],
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a user persona node
 */
export function createUserPersonaNode(
  persona: any, 
  existingNodes: Node[] = [],
  isUserCreated: boolean = false
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.userPersona;
  
  // Use the improved grid-based positioning
  const finalPosition = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'userPersona',
    undefined,
    'ideation-discovery',
    isUserCreated
  );
  
  return {
    id: uuidv4(),
    type: 'userPersona',
    position: finalPosition,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'User Persona',
      content: '',
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: persona.name || 'User Persona',
      role: persona.role || 'Role',
      painPoint: persona.painPoint || 'Pain point',
      emoji: persona.emoji || '👤',
      editable: true,
      width: defaults.size.width,
      height: defaults.size.height,
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
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'User Persona',
      content: '',
      color: 'userPersona',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'userPersona' },
      name: 'Target User',
      role: 'Primary User',
      painPoint: targetUsers,
      emoji: '👤',
      editable: true,
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a competitor node
 */
export function createCompetitorNode(
  competitor: any, 
  existingNodes: Node[] = [],
  isUserCreated: boolean = false
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.competitor;
  const finalPosition = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'competitor',
    undefined,
    'ideation-discovery',
    isUserCreated
  );
  
  return {
    id: uuidv4(),
    type: 'competitor',
    position: finalPosition,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Competitor',
      content: '',
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
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a feature pack node
 */
export function createFeaturePackNode(
  pack: string, 
  existingNodes: Node[] = [],
  isUserCreated: boolean = false
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
  
  // Use the improved grid-based positioning
  const finalPosition = getSmartNodePosition(
    existingNodes,
    STAGE2_NODE_DEFAULTS.feature.size,
    'feature',
    undefined,
    'feature-planning',
    isUserCreated
  );
  
  return {
    id: uuidv4(),
    type: 'feature',
    position: finalPosition,
    width: STAGE2_NODE_DEFAULTS.feature.size.width,
    height: STAGE2_NODE_DEFAULTS.feature.size.height,
    data: {
      title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
      content: `Feature pack selected\nIncludes core ${pack} functionality`,
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
      width: STAGE2_NODE_DEFAULTS.feature.size.width,
      height: STAGE2_NODE_DEFAULTS.feature.size.height,
      resizable: true
    }
  };
}

/**
 * Create a custom feature node
 */
export function createCustomFeatureNode(
  feature: any, 
  existingNodes: Node[] = [],
  isUserCreated: boolean = false
): Node {
  // Use the improved grid-based positioning
  const finalPosition = getSmartNodePosition(
    existingNodes,
    STAGE2_NODE_DEFAULTS.feature.size,
    'feature',
    undefined,
    'feature-planning',
    isUserCreated
  );
  
  return {
    id: uuidv4(),
    type: 'feature',
    position: finalPosition,
    width: STAGE2_NODE_DEFAULTS.feature.size.width,
    height: STAGE2_NODE_DEFAULTS.feature.size.height,
    data: {
      title: feature.name,
      content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
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
      width: STAGE2_NODE_DEFAULTS.feature.size.width,
      height: STAGE2_NODE_DEFAULTS.feature.size.height,
      resizable: true
    }
  };
}

/**
 * Create a natural language feature node
 */
export function createNaturalLanguageFeatureNode(
  naturalLanguageFeatures: string,
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    STAGE2_NODE_DEFAULTS.feature.size,
    STAGE2_NODE_TYPES.FEATURE,
    { x: 700, y: 350 },
    'feature-planning'
  );
  
  return {
    id: uuidv4(),
    type: 'feature',
    position,
    width: STAGE2_NODE_DEFAULTS.feature.size.width,
    height: STAGE2_NODE_DEFAULTS.feature.size.height,
    data: {
      title: 'Feature Description',
      content: naturalLanguageFeatures,
      color: 'blue',
      connections: [],
      metadata: { stage: 'feature-planning', type: 'description' },
      width: STAGE2_NODE_DEFAULTS.feature.size.width,
      height: STAGE2_NODE_DEFAULTS.feature.size.height,
      resizable: true
    }
  };
}

/**
 * Create an architecture node
 */
export function createArchitectureNode(
  architectureData: any,
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE2_NODE_DEFAULTS.architecture;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE2_NODE_TYPES.ARCHITECTURE,
    defaults.position,
    'feature-planning'
  );
  
  return {
    id: uuidv4(),
    type: 'architecture',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Architecture Blueprint',
      content: `Architecture blueprint with ${architectureData.screens.length} screens, ${architectureData.apiRoutes.length} API routes, and ${architectureData.components.length} components.`,
      color: 'indigo',
      connections: [],
      metadata: { 
        stage: 'feature-planning',
        architectureData
      },
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a route-API mapping node
 */
export function createRouteApiMappingNode(
  route: any,
  apiEndpoints: any[],
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE2_NODE_DEFAULTS.routeApiMapping;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE2_NODE_TYPES.ROUTE_API_MAPPING,
    undefined,
    'architecture-design'
  );
  
  return {
    id: `route-api-${route.id}-${Date.now()}`,
    type: 'routeApiMapping',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: `${route.path} Mapping`,
      route,
      apiEndpoints,
      color: 'cyan',
      connections: [],
      metadata: { 
        stage: 'architecture-design', 
        routeId: route.id,
        nodeType: 'routeApiMapping'
      },
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create an information architecture node
 */
export function createInformationArchitectureNode(
  screens: any[],
  dataModels: any[],
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE3_NODE_DEFAULTS.informationArchitecture;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE3_NODE_TYPES.INFORMATION_ARCHITECTURE,
    defaults.position,
    'structure-flow'
  );
  
  return {
    id: 'information-architecture',
    type: 'informationArchitecture',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Information Architecture',
      content: `Information architecture with ${screens.length} screens and ${dataModels.length} data models.`,
      color: 'blue',
      connections: [],
      metadata: { 
        stage: 'structure-flow',
        nodeType: 'informationArchitecture'
      },
      screens,
      dataModels,
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a user journey node
 */
export function createUserJourneyNode(
  userFlows: any[],
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE3_NODE_DEFAULTS.userJourney;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE3_NODE_TYPES.USER_JOURNEY,
    defaults.position,
    'structure-flow'
  );
  
  return {
    id: 'user-journey',
    type: 'userJourney',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'User Journey Map',
      content: `User journey map with ${userFlows.length} flows.`,
      color: 'purple',
      connections: [],
      metadata: { 
        stage: 'structure-flow',
        nodeType: 'userJourney'
      },
      userFlows,
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a state data flow node
 */
export function createStateDataFlowNode(
  stateManagement: string,
  dataFlow: string,
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE3_NODE_DEFAULTS.stateDataFlow;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE3_NODE_TYPES.STATE_DATA_FLOW,
    defaults.position,
    'structure-flow'
  );
  
  return {
    id: 'state-data-flow',
    type: 'stateDataFlow',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'State & Data Flow',
      content: `State management: ${stateManagement}\nData flow: ${dataFlow}`,
      color: 'red',
      connections: [],
      metadata: { 
        stage: 'structure-flow',
        nodeType: 'stateDataFlow'
      },
      stateManagement,
      dataFlow,
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a markdown code node
 */
export function createMarkdownCodeNode(
  content: string,
  title: string,
  source: string,
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE3_NODE_DEFAULTS.markdownCode;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    STAGE3_NODE_TYPES.MARKDOWN_CODE,
    defaults.position,
    'structure-flow'
  );
  
  return {
    id: `markdown-code-${Date.now()}`,
    type: 'markdownCode',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title,
      content,
      source,
      editable: true,
      color: 'green',
      connections: [],
      metadata: { 
        stage: 'structure-flow',
        nodeType: 'markdownCode'
      },
      width: defaults.size.width,
      height: defaults.size.height,
      resizable: true
    }
  };
}

/**
 * Create a screen node
 */
export function createScreenNode(
  screen: any, 
  existingNodes: Node[] = []
): Node {
  const finalPosition = getSmartNodePosition(
    existingNodes,
    { width: 150, height: 100 },
    'ux-flow',
    undefined,
    'structure-flow'
  );
  
  return {
    id: uuidv4(),
    type: 'ux-flow',
    position: finalPosition,
    width: 150,
    height: 100,
    data: {
      title: screen.name,
      content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
      color: 'green',
      connections: [],
      metadata: { stage: 'structure-flow', screenType: screen.type, sourceId: screen.id },
      width: 150,
      height: 100,
      resizable: true
    }
  };
}

/**
 * Create a user flow node
 */
export function createUserFlowNode(
  flow: any, 
  existingNodes: Node[] = []
): Node {
  const finalPosition = getSmartNodePosition(
    existingNodes,
    { width: 200, height: 120 },
    'ux-flow',
    undefined,
    'structure-flow'
  );
  
  return {
    id: uuidv4(),
    type: 'ux-flow',
    position: finalPosition,
    width: 200,
    height: 120,
    data: {
      title: flow.name,
      content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
      color: 'green',
      connections: [],
      metadata: { stage: 'structure-flow', flowType: 'user-journey', sourceId: flow.id },
      width: 200,
      height: 120,
      resizable: true
    }
  };
}

/**
 * Create a database table node
 */
export function createDatabaseTableNode(
  table: any, 
  existingNodes: Node[] = []
): Node {
  const finalPosition = getSmartNodePosition(
    existingNodes,
    { width: 180, height: 100 },
    'system',
    undefined,
    'architecture-design'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position: finalPosition,
    width: 180,
    height: 100,
    data: {
      title: `${table.name} Table`,
      content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', tableType: 'database', sourceId: table.id },
      width: 180,
      height: 100,
      resizable: true
    }
  };
}

/**
 * Create an API endpoints node
 */
export function createAPIEndpointsNode(
  apiEndpoints: any[], 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 160, height: 80 },
    'system',
    undefined,
    'architecture-design'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position,
    width: 160,
    height: 80,
    data: {
      title: 'API Endpoints',
      content: `${apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', systemType: 'api' },
      width: 160,
      height: 80,
      resizable: true
    }
  };
}

/**
 * Create a route node
 */
export function createRouteNode(
  route: any, 
  existingNodes: Node[] = []
): Node {
  const finalPosition = getSmartNodePosition(
    existingNodes,
    { width: 140, height: 90 },
    'system',
    undefined,
    'architecture-design'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position: finalPosition,
    width: 140,
    height: 90,
    data: {
      title: `${route.path} Route`,
      content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`,
      color: 'red',
      connections: [],
      metadata: { stage: 'architecture-design', routeType: 'page', sourceId: route.id },
      width: 140,
      height: 90,
      resizable: true
    }
  };
}

/**
 * Create a design system node
 */
export function createDesignSystemNode(
  designSystem: string, 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 160, height: 80 },
    'wireframe',
    undefined,
    'interface-interaction'
  );
  
  return {
    id: uuidv4(),
    type: 'wireframe',
    position,
    width: 160,
    height: 80,
    data: {
      title: 'Design System',
      content: `${designSystem}\n\nComponent library and styling approach`,
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', uiType: 'design-system' },
      width: 160,
      height: 80,
      resizable: true
    }
  };
}

/**
 * Create a branding node
 */
export function createBrandingNode(
  brandingData: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    bodyFont?: string;
    borderRadius?: string;
    designSystem?: string;
  },
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE1_NODE_DEFAULTS.branding;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'branding',
    defaults.position,
    'interface-interaction'
  );
  
  return {
    id: uuidv4(),
    type: 'branding',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      title: 'Brand Identity',
      content: '',
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', nodeType: 'branding' },
      primaryColor: brandingData.primaryColor || '#3B82F6',
      secondaryColor: brandingData.secondaryColor || '#10B981',
      accentColor: brandingData.accentColor || '#F59E0B',
      fontFamily: brandingData.fontFamily || 'Inter',
      bodyFont: brandingData.bodyFont || 'Roboto',
      borderRadius: brandingData.borderRadius || 'medium',
      designSystem: brandingData.designSystem || 'shadcn',
      width: defaults.size.width,
      height: defaults.size.height,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a layout node
 */
export function createLayoutNode(
  layoutBlocks: any[], 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 160, height: 80 },
    'wireframe',
    undefined,
    'interface-interaction'
  );
  
  return {
    id: uuidv4(),
    type: 'wireframe',
    position,
    width: 160,
    height: 80,
    data: {
      title: 'Layout Structure',
      content: `${layoutBlocks.length} layout blocks\n\n${layoutBlocks.map((block: any) => block.type).join(', ')}`,
      color: 'purple',
      connections: [],
      metadata: { stage: 'interface-interaction', uiType: 'layout' },
      width: 160,
      height: 80,
      resizable: true
    }
  };
}

/**
 * Create an auth methods node
 */
export function createAuthMethodsNode(
  authMethods: any[], 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 180, height: 100 },
    'system',
    undefined,
    'user-auth-flow'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position,
    width: 180,
    height: 100,
    data: {
      title: 'Auth Methods',
      content: `${authMethods.length} methods enabled\n\n${authMethods.map((m: any) => `• ${m.name}`).join('\n')}`,
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'methods' },
      width: 180,
      height: 100,
      resizable: true
    }
  };
}

/**
 * Create a user roles node
 */
export function createUserRolesNode(
  userRoles: any[], 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 180, height: 120 },
    'system',
    undefined,
    'user-auth-flow'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position,
    width: 180,
    height: 120,
    data: {
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
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'roles' },
      width: 180,
      height: 120,
      resizable: true
    }
  };
}

/**
 * Create a security features node
 */
export function createSecurityFeaturesNode(
  securityFeatures: any[], 
  existingNodes: Node[] = []
): Node {
  const position = getSmartNodePosition(
    existingNodes,
    { width: 200, height: 100 },
    'system',
    undefined,
    'user-auth-flow'
  );
  
  return {
    id: uuidv4(),
    type: 'system',
    position,
    width: 200,
    height: 100,
    data: {
      title: 'Security Features',
      content: `${securityFeatures.length} features enabled\n\n${securityFeatures.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n')}${securityFeatures.length > 4 ? '\n...' : ''}`,
      color: 'red',
      connections: [],
      metadata: { stage: 'user-auth-flow', authType: 'security' },
      width: 200,
      height: 100,
      resizable: true
    }
  };
}

/**
 * Create an AI analysis node
 */
export function createAIAnalysisNode(
  stageData: any, 
  nodeCount: number,
  existingNodes: Node[] = []
): Node | null {
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
  
  const position = getSmartNodePosition(
    existingNodes,
    { width: 220, height: 180 },
    'agent-output',
    { x: 100 + (nodeCount * 10), y: 100 + (nodeCount * 10) }
  );

  return {
    id: uuidv4(),
    type: 'agent-output',
    position,
    width: 220,
    height: 180,
    data: {
      title: 'AI Analysis',
      content,
      color: 'gray',
      connections: [],
      metadata: {
        generated: true,
        stagesCompleted: completedStages,
        totalNodes: nodeCount,
        timestamp: new Date().toISOString()
      },
      width: 220,
      height: 180,
      resizable: true
    }
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
    width: 160,
    height: 80,
    data: {
      title: 'Platform',
      content: '',
      color: 'blue',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'platform' },
      platform: platform,
      width: 160,
      height: 80,
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
    width: 180,
    height: 120,
    data: {
      title: 'Tech Stack',
      content: '',
      color: 'indigo',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'techStack' },
      techStack: techStack,
      width: 180,
      height: 120,
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
    width: 180,
    height: 120,
    data: {
      title: 'UI Style',
      content: '',
      color: 'pink',
      connections: [],
      metadata: { stage: 'ideation-discovery', nodeType: 'uiStyle' },
      uiStyle: uiStyle,
      width: 180,
      height: 120,
      editable: true,
      resizable: true
    }
  };
}

/**
 * Create a lofi layout node
 */
export function createLofiLayoutNode(
  layoutData: any = {},
  existingNodes: Node[] = []
): Node {
  const defaults = STAGE3_NODE_DEFAULTS.lofiLayout;
  const position = getSmartNodePosition(
    existingNodes,
    defaults.size,
    'lofiLayout',
    defaults.position,
    'interface-interaction'
  );
  
  // Get template data
  const templateName = layoutData.templateName || 'Dashboard Layout';
  
  // Get layout blocks, either from provided data or default template
  const layoutBlocks = layoutData.layoutBlocks || [
    { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
    { id: 'sidebar', type: 'sidebar', label: 'Sidebar', position: { x: 0, y: 10 }, size: { width: 20, height: 80 }, locked: true },
    { id: 'content', type: 'content', label: 'Content Area', position: { x: 20, y: 10 }, size: { width: 80, height: 80 }, locked: true },
    { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
  ];
  
  return {
    id: layoutData.layoutId || uuidv4(),
    type: 'lofiLayout',
    position,
    width: defaults.size.width,
    height: defaults.size.height,
    data: {
      layoutId: layoutData.layoutId || uuidv4(),
      templateName,
      layoutBlocks,
      description: layoutData.description || `${templateName} wireframe layout`,
      viewMode: layoutData.viewMode || 'desktop',
      editable: true,
      color: 'blue',
      connections: [],
      metadata: { 
        stage: 'interface-interaction', 
        nodeType: 'lofiLayout',
        layoutType: templateName
      },
      width: defaults.size.width,
      height: defaults.size.height,
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