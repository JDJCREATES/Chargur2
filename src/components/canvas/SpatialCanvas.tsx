import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CanvasNode, CanvasNodeData } from './CanvasNode';
import { CanvasConnection } from './CanvasConnection';
import { CanvasToolbar } from './CanvasToolbar';
import { 
  AppNameNode, 
  TaglineNode, 
  CoreProblemNode, 
  MissionNode, 
  UserPersonaNode, 
  ValuePropositionNode, 
  CompetitorNode,
  STAGE1_NODE_TYPES,
  STAGE1_NODE_DEFAULTS 
} from './customnodetypes/stage1nodes';
import { Stage, StageData } from '../../types';


interface SpatialCanvasProps {
  currentStage?: Stage;
  stageData: StageData;
  onSendMessage: (message: string) => void;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'reference' | 'dependency' | 'flow';
}


export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  stageData
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [lastProcessedData, setLastProcessedData] = useState<{ [key: string]: any }>({});

  // Load canvas state from localStorage on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem('chargur-canvas-nodes');
    const savedConnections = localStorage.getItem('chargur-canvas-connections');
    const savedLastProcessed = localStorage.getItem('chargur-last-processed-data');
    
    if (savedNodes) {
      try {
        setNodes(JSON.parse(savedNodes));
      } catch (e) {
        console.warn('Failed to load saved nodes');
      }
    }
    
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections));
      } catch (e) {
        console.warn('Failed to load saved connections');
      }
    }
    
    if (savedLastProcessed) {
      try {
        setLastProcessedData(JSON.parse(savedLastProcessed));
      } catch (e) {
        console.warn('Failed to load last processed data');
      }
    }
  }, []);

  // Save canvas state to localStorage whenever nodes or connections change
  useEffect(() => {
    localStorage.setItem('chargur-canvas-nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('chargur-canvas-connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('chargur-last-processed-data', JSON.stringify(lastProcessedData));
  }, [lastProcessedData]);

  // Update canvas with new data from stages (additive approach)
  useEffect(() => {
    updateCanvasFromStageData();
  }, [stageData]);

  const updateCanvasFromStageData = () => {
    // Check what data has changed and only add new nodes
    const currentDataHash = JSON.stringify(stageData);
    const lastDataHash = JSON.stringify(lastProcessedData);
    
    if (currentDataHash === lastDataHash) {
      return; // No changes, don't update
    }

    const newNodes: CanvasNodeData[] = [];
    let nodeId = 1;

    // Process ideation data
    const ideationData = stageData['ideation-discovery'];
    const lastIdeationData = lastProcessedData['ideation-discovery'] || {};
    
    if (ideationData && JSON.stringify(ideationData) !== JSON.stringify(lastIdeationData)) {
      // Remove old ideation nodes
      setNodes(prev => prev.filter(node => 
        !node.metadata?.stage || 
        node.metadata.stage !== 'ideation-discovery' ||
        !Object.values(STAGE1_NODE_TYPES).includes(node.type as any)
      ));
      
      // Create custom ideation nodes based on data
      if (ideationData.appName) {
        newNodes.push({
          id: STAGE1_NODE_TYPES.APP_NAME,
          type: 'appName',
          title: 'App Name',
          content: '',
          position: STAGE1_NODE_DEFAULTS.appName.position,
          size: STAGE1_NODE_DEFAULTS.appName.size,
          color: 'appName',
          connections: [],
          metadata: { stage: 'ideation-discovery', nodeType: 'appName' },
          value: ideationData.appName,
          editable: true,
          nameHistory: []
        });
      }

      if (ideationData.tagline) {
        newNodes.push({
          id: STAGE1_NODE_TYPES.TAGLINE,
          type: 'tagline',
          title: 'Tagline',
          content: '',
          position: STAGE1_NODE_DEFAULTS.tagline.position,
          size: STAGE1_NODE_DEFAULTS.tagline.size,
          color: 'tagline',
          connections: [],
          metadata: { stage: 'ideation-discovery', nodeType: 'tagline' },
          value: ideationData.tagline,
          editable: true
        });
      }

      if (ideationData.problemStatement) {
        newNodes.push({
          id: STAGE1_NODE_TYPES.CORE_PROBLEM,
          type: 'coreProblem',
          title: 'Core Problem',
          content: '',
          position: STAGE1_NODE_DEFAULTS.coreProblem.position,
          size: STAGE1_NODE_DEFAULTS.coreProblem.size,
          color: 'coreProblem',
          connections: [],
          metadata: { stage: 'ideation-discovery', nodeType: 'coreProblem' },
          value: ideationData.problemStatement,
          editable: true,
          keywords: []
        });
      }

      if (ideationData.appIdea) {
        newNodes.push({
          id: STAGE1_NODE_TYPES.MISSION,
          type: 'mission',
          title: 'Mission',
          content: '',
          position: STAGE1_NODE_DEFAULTS.mission.position,
          size: STAGE1_NODE_DEFAULTS.mission.size,
          color: 'mission',
          connections: [],
          metadata: { stage: 'ideation-discovery', nodeType: 'mission' },
          value: ideationData.appIdea,
          editable: true
        });
      }

      if (ideationData.valueProposition) {
        newNodes.push({
          id: STAGE1_NODE_TYPES.VALUE_PROPOSITION,
          type: 'valueProp',
          title: 'Value Proposition',
          content: '',
          position: STAGE1_NODE_DEFAULTS.valueProp.position,
          size: STAGE1_NODE_DEFAULTS.valueProp.size,
          color: 'valueProp',
          connections: [],
          metadata: { stage: 'ideation-discovery', nodeType: 'valueProp' },
          value: ideationData.valueProposition,
          editable: true,
          bulletPoints: []
        });
      }

      // Create user persona nodes from structured data
      if (ideationData.userPersonas && Array.isArray(ideationData.userPersonas)) {
        ideationData.userPersonas.forEach((persona, index) => {
          newNodes.push({
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
            editable: true
          });
        });
      }
      
      // Fallback: Create a user persona node if legacy targetUsers is defined
      if (ideationData.targetUsers && !ideationData.userPersonas) {
        newNodes.push({
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
          painPoint: ideationData.targetUsers,
          emoji: '👤',
          editable: true
        });
      }
    }

    // Process feature planning data
    const featureData = stageData['feature-planning'];
    const lastFeatureData = lastProcessedData['feature-planning'] || {};
    
    if (featureData && JSON.stringify(featureData) !== JSON.stringify(lastFeatureData)) {
      // Remove old feature nodes
      setNodes(prev => prev.filter(node => !node.metadata?.stage || node.metadata.stage !== 'feature-planning'));
      
      let featureX = 100;
      let featureY = 350;
      
      if (featureData.selectedFeaturePacks) {
        featureData.selectedFeaturePacks.forEach((pack: string, index: number) => {
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
          
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: packNames[pack] || pack.charAt(0).toUpperCase() + pack.slice(1),
            content: `Feature pack selected\nIncludes core ${pack} functionality`,
            position: { x: featureX + (index % 3) * 200, y: featureY + Math.floor(index / 3) * 120 },
            size: { width: 180, height: 100 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', pack }
          });
        });
      }

      if (featureData.customFeatures) {
        const startIndex = featureData.selectedFeaturePacks?.length || 0;
        featureData.customFeatures.forEach((feature: any, index: number) => {
          newNodes.push({
            id: `feature-${nodeId++}`,
            type: 'feature',
            title: feature.name,
            content: `${feature.description || 'Custom feature'}\n\nPriority: ${feature.priority || 'medium'}\nComplexity: ${feature.complexity || 'medium'}`,
            position: { 
              x: featureX + ((startIndex + index) % 3) * 200, 
              y: featureY + Math.floor((startIndex + index) / 3) * 120 
            },
            size: { width: 180, height: 120 },
            color: 'blue',
            connections: [],
            metadata: { stage: 'feature-planning', custom: true }
          });
        });
      }

      // Add natural language features if provided
      if (featureData.naturalLanguageFeatures) {
        newNodes.push({
          id: `feature-${nodeId++}`,
          type: 'feature',
          title: 'Feature Description',
          content: featureData.naturalLanguageFeatures,
          position: { x: 700, y: 350 },
          size: { width: 220, height: 140 },
          color: 'blue',
          connections: [],
          metadata: { stage: 'feature-planning', type: 'description' }
        });
      }
    }

    // Process structure flow data
    const structureData = stageData['structure-flow'];
    const lastStructureData = lastProcessedData['structure-flow'] || {};
    
    if (structureData && JSON.stringify(structureData) !== JSON.stringify(lastStructureData)) {
      // Remove old structure nodes
      setNodes(prev => prev.filter(node => !node.metadata?.stage || node.metadata.stage !== 'structure-flow'));
      
      let flowX = 100;
      let flowY = 600;
      
      if (structureData.screens) {
        structureData.screens.forEach((screen: any, index: number) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: screen.name,
            content: `Screen type: ${screen.type}\n\n${screen.description || 'Core app screen'}`,
            position: { x: flowX + (index % 4) * 160, y: flowY },
            size: { width: 150, height: 100 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', screenType: screen.type }
          });
        });
      }

      if (structureData.userFlows) {
        structureData.userFlows.forEach((flow: any, index: number) => {
          newNodes.push({
            id: `ux-flow-${nodeId++}`,
            type: 'ux-flow',
            title: flow.name,
            content: `User journey:\n${flow.steps?.slice(0, 3).join(' → ') || 'Flow steps'}${flow.steps?.length > 3 ? '...' : ''}`,
            position: { x: flowX + (index % 3) * 220, y: flowY + 120 },
            size: { width: 200, height: 120 },
            color: 'green',
            connections: [],
            metadata: { stage: 'structure-flow', flowType: 'user-journey' }
          });
        });
      }
    }

    // Process architecture data
    const architectureData = stageData['architecture-design'];
    const lastArchitectureData = lastProcessedData['architecture-design'] || {};
    
    if (architectureData && JSON.stringify(architectureData) !== JSON.stringify(lastArchitectureData)) {
      // Remove old architecture nodes
      setNodes(prev => prev.filter(node => !node.metadata?.stage || node.metadata.stage !== 'architecture-design'));
      
      let systemX = 100;
      let systemY = 800;
      
      if (architectureData.databaseSchema) {
        architectureData.databaseSchema.forEach((table: any, index: number) => {
          newNodes.push({
            id: `system-${nodeId++}`,
            type: 'system',
            title: `${table.name} Table`,
            content: `Database table\n\nFields:\n${table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined'}${table.fields?.length > 4 ? '\n...' : ''}`,
            position: { x: systemX + (index % 3) * 200, y: systemY },
            size: { width: 180, height: 100 },
            color: 'red',
            connections: [],
            metadata: { stage: 'architecture-design', tableType: 'database' }
          });
        });
      }

      if (architectureData.apiEndpoints) {
        newNodes.push({
          id: `system-${nodeId++}`,
          type: 'system',
          title: 'API Endpoints',
          content: `${architectureData.apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`,
          position: { x: systemX + 400, y: systemY },
          size: { width: 160, height: 80 },
          color: 'red',
          connections: [],
          metadata: { stage: 'architecture-design', systemType: 'api' }
        });
      }

      if (architectureData.sitemap) {
        architectureData.sitemap.forEach((route: any, index: number) => {
          newNodes.push({
            id: `system-${nodeId++}`,
            type: 'system',
            title: `${route.path} Route`,
            content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`,
            position: { x: systemX + (index % 4) * 150, y: systemY + 120 },
            size: { width: 140, height: 90 },
            color: 'red',
            connections: [],
            metadata: { stage: 'architecture-design', routeType: 'page' }
          });
        });
      }

      if (architectureData.envVariables) {
        newNodes.push({
          id: `system-${nodeId++}`,
          type: 'system',
          title: 'Environment Config',
          content: `${architectureData.envVariables.length} variables\n\nIncludes secrets, URLs, and config`,
          position: { x: systemX + 600, y: systemY },
          size: { width: 160, height: 80 },
          color: 'red',
          connections: [],
          metadata: { stage: 'architecture-design', systemType: 'config' }
        });
      }

      if (architectureData.integrations) {
        newNodes.push({
          id: `system-${nodeId++}`,
          type: 'system',
          title: 'Integrations',
          content: `${architectureData.integrations.length} services\n\n${architectureData.integrations.slice(0, 3).join('\n')}${architectureData.integrations.length > 3 ? '\n...' : ''}`,
          position: { x: systemX + 200, y: systemY + 220 },
          size: { width: 180, height: 100 },
          color: 'red',
          connections: [],
          metadata: { stage: 'architecture-design', systemType: 'integration' }
        });
      }
    }

    // Process interface design data
    const interfaceData = stageData['interface-interaction'] || {};
    const lastInterfaceData = lastProcessedData['interface-interaction'] || {};
    
    if (interfaceData && JSON.stringify(interfaceData) !== JSON.stringify(lastInterfaceData)) {
      // Remove old interface nodes
      setNodes(prev => prev.filter(node => !node.metadata?.stage || node.metadata.stage !== 'interface-interaction'));
      
      let uiX = 100;
      let uiY = 1000;
      
      if (interfaceData.selectedDesignSystem) {
        newNodes.push({
          id: `ui-${nodeId++}`,
          type: 'wireframe',
          title: 'Design System',
          content: `${interfaceData.selectedDesignSystem}\n\nComponent library and styling approach`,
          position: { x: uiX, y: uiY },
          size: { width: 160, height: 80 },
          color: 'purple',
          connections: [],
          metadata: { stage: 'interface-interaction', uiType: 'design-system' }
        });
      }

      if (interfaceData.customBranding) {
        const branding = interfaceData.customBranding;
        newNodes.push({
          id: `ui-${nodeId++}`,
          type: 'wireframe',
          title: 'Brand Colors',
          content: `Primary: ${branding.primaryColor}\nSecondary: ${branding.secondaryColor}\nFont: ${branding.fontFamily}`,
          position: { x: uiX + 180, y: uiY },
          size: { width: 140, height: 80 },
          color: 'purple',
          connections: [],
          metadata: { stage: 'interface-interaction', uiType: 'branding' }
        });
      }

      if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
        newNodes.push({
          id: `ui-${nodeId++}`,
          type: 'wireframe',
          title: 'Layout Structure',
          content: `${interfaceData.layoutBlocks.length} layout blocks\n\n${interfaceData.layoutBlocks.map((block: any) => block.type).join(', ')}`,
          position: { x: uiX + 340, y: uiY },
          size: { width: 160, height: 80 },
          color: 'purple',
          connections: [],
          metadata: { stage: 'interface-interaction', uiType: 'layout' }
        });
      }

      if (interfaceData.interactionRules && interfaceData.interactionRules.length > 0) {
        newNodes.push({
          id: `ui-${nodeId++}`,
          type: 'wireframe',
          title: 'Interactions',
          content: `${interfaceData.interactionRules.length} interaction rules\n\n${interfaceData.interactionRules.slice(0, 3).map((rule: any) => `${rule.component}: ${rule.trigger}`).join('\n')}`,
          position: { x: uiX, y: uiY + 100 },
          size: { width: 180, height: 90 },
          color: 'purple',
          connections: [],
          metadata: { stage: 'interface-interaction', uiType: 'interactions' }
        });
      }

      if (interfaceData.copywriting && interfaceData.copywriting.length > 0) {
        newNodes.push({
          id: `ui-${nodeId++}`,
          type: 'wireframe',
          title: 'UX Copy',
          content: `${interfaceData.copywriting.length} text elements\n\nButtons, labels, and messaging`,
          position: { x: uiX + 200, y: uiY + 100 },
          size: { width: 140, height: 80 },
          color: 'purple',
          connections: [],
          metadata: { stage: 'interface-interaction', uiType: 'copywriting' }
        });
      }
    }

    // Process user auth flow data
    const authData = stageData['user-auth-flow'] || {};
    const lastAuthData = lastProcessedData['user-auth-flow'] || {};
    
    if (authData && JSON.stringify(authData) !== JSON.stringify(lastAuthData)) {
      // Remove old auth nodes
      setNodes(prev => prev.filter(node => !node.metadata?.stage || node.metadata.stage !== 'user-auth-flow'));
      
      let authX = 100;
      let authY = 1200;
      
      // Authentication Methods
      if (authData.authMethods) {
        const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
        if (enabledMethods.length > 0) {
          newNodes.push({
            id: `auth-${nodeId++}`,
            type: 'system',
            title: 'Auth Methods',
            content: `${enabledMethods.length} methods enabled\n\n${enabledMethods.map((m: any) => `• ${m.name}`).join('\n')}`,
            position: { x: authX, y: authY },
            size: { width: 180, height: 100 },
            color: 'red',
            connections: [],
            metadata: { stage: 'user-auth-flow', authType: 'methods' }
          });
        }
      }

      // User Roles & Permissions
      if (authData.userRoles && authData.userRoles.length > 0) {
        newNodes.push({
          id: `auth-${nodeId++}`,
          type: 'system',
          title: 'User Roles',
          content: `${authData.userRoles.length} roles defined\n\n${authData.userRoles.map((r: any) => `• ${r.name}: ${r.description.slice(0, 20)}...`).join('\n')}`,
          position: { x: authX + 200, y: authY },
          size: { width: 180, height: 120 },
          color: 'red',
          connections: [],
          metadata: { stage: 'user-auth-flow', authType: 'roles' }
        });
      }

      // Session Management
      if (authData.sessionManagement) {
        const session = authData.sessionManagement;
        newNodes.push({
          id: `auth-${nodeId++}`,
          type: 'system',
          title: 'Session Management',
          content: `Provider: ${session.provider}\nStorage: ${session.tokenStorage}\nTimeout: ${session.sessionTimeout} days\nAuto-refresh: ${session.autoRefresh ? 'Yes' : 'No'}`,
          position: { x: authX + 400, y: authY },
          size: { width: 160, height: 100 },
          color: 'red',
          connections: [],
          metadata: { stage: 'user-auth-flow', authType: 'session' }
        });
      }

      // Security Features
      if (authData.securityFeatures) {
        const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
        if (enabledSecurity.length > 0) {
          newNodes.push({
            id: `auth-${nodeId++}`,
            type: 'system',
            title: 'Security Features',
            content: `${enabledSecurity.length} features enabled\n\n${enabledSecurity.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n')}${enabledSecurity.length > 4 ? '\n...' : ''}`,
            position: { x: authX, y: authY + 120 },
            size: { width: 200, height: 100 },
            color: 'red',
            connections: [],
            metadata: { stage: 'user-auth-flow', authType: 'security' }
          });
        }
      }

      // User Metadata & Profiles
      if (authData.userMetadata) {
        const metadata = authData.userMetadata;
        newNodes.push({
          id: `auth-${nodeId++}`,
          type: 'system',
          title: 'User Profiles',
          content: `Required: ${metadata.requiredFields?.length || 0} fields\nOptional: ${metadata.optionalFields?.length || 0} fields\nPreferences: ${metadata.preferences?.length || 0} settings`,
          position: { x: authX + 220, y: authY + 120 },
          size: { width: 160, height: 90 },
          color: 'red',
          connections: [],
          metadata: { stage: 'user-auth-flow', authType: 'profiles' }
        });
      }

      // Edge Cases
      if (authData.edgeCases && authData.edgeCases.length > 0) {
        const highPriorityCases = authData.edgeCases.filter((c: any) => c.priority === 'high');
        newNodes.push({
          id: `auth-${nodeId++}`,
          type: 'system',
          title: 'Edge Cases',
          content: `${authData.edgeCases.length} scenarios handled\n${highPriorityCases.length} high priority\n\n${authData.edgeCases.slice(0, 3).map((c: any) => `• ${c.scenario}`).join('\n')}`,
          position: { x: authX + 400, y: authY + 120 },
          size: { width: 180, height: 100 },
          color: 'red',
          connections: [],
          metadata: { stage: 'user-auth-flow', authType: 'edge-cases' }
        });
      }

      // Onboarding Flow
      if (authData.onboardingFlow) {
        const enabledSteps = Object.entries(authData.onboardingFlow).filter(([_, enabled]) => enabled).length;
        if (enabledSteps > 0) {
          newNodes.push({
            id: `auth-${nodeId++}`,
            type: 'ux-flow',
            title: 'Onboarding Flow',
            content: `${enabledSteps} steps enabled\n\nGuides new users through setup`,
            position: { x: authX + 600, y: authY },
            size: { width: 160, height: 80 },
            color: 'green',
            connections: [],
            metadata: { stage: 'user-auth-flow', authType: 'onboarding' }
          });
        }
      }
    }

    // Update AI analysis node
    const totalStageNodes = newNodes.length;
    const existingNodes = nodes.filter(n => !n.metadata?.generated);
    const totalNodes = existingNodes.length + totalStageNodes;
    
    if (totalNodes > 0) {
      // Remove old AI analysis node
      setNodes(prev => prev.filter(node => !node.metadata?.generated));
      
      const completedStages = Object.keys(stageData).length;
      
      newNodes.push({
        id: `agent-output-${nodeId++}`,
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
      });
    }

    // Add new nodes to existing ones
    if (newNodes.length > 0) {
      setNodes(prev => [...prev, ...newNodes]);
    }
    
    // Update last processed data
    setLastProcessedData({ ...stageData });
  };

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setLastProcessedData({});
    localStorage.removeItem('chargur-canvas-nodes');
    localStorage.removeItem('chargur-canvas-connections');
    localStorage.removeItem('chargur-last-processed-data');
  }, []);

  const addNode = useCallback((type: CanvasNodeData['type']) => {
    let newNode: CanvasNodeData;
    
    // Check if it's a custom ideation node type
    if (Object.values(STAGE1_NODE_TYPES).includes(type as any)) {
      const defaults = STAGE1_NODE_DEFAULTS[type as keyof typeof STAGE1_NODE_DEFAULTS];
      newNode = {
        id: type === 'userPersona' || type === 'competitor' ? `${type}-${Date.now()}` : type,
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: '',
        position: { 
          x: defaults.position.x + Math.random() * 50 - 25, 
          y: defaults.position.y + Math.random() * 50 - 25 
        },
        size: defaults.size,
        color: type,
        connections: [],
        metadata: { stage: 'ideation-discovery', nodeType: type },
        // Add custom properties for ideation nodes
        ...(type === 'appName' && { value: '', editable: true, nameHistory: [] }),
        ...(type === 'tagline' && { value: '', editable: true }),
        ...(type === 'coreProblem' && { value: '', editable: true, keywords: [] }),
        ...(type === 'mission' && { value: '', editable: true }),
        ...(type === 'userPersona' && { name: '', role: '', painPoint: '', emoji: '👤', editable: true }),
        ...(type === 'valueProp' && { value: '', editable: true, bulletPoints: [] }),
        ...(type === 'competitor' && { name: '', notes: '', link: '', editable: true }),
      };
    } else {
      // Default node creation for other types
      newNode = {
        id: `${type}-${Date.now()}`,
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: 'Click edit to add content...',
        position: { 
          x: Math.random() * 300 + 150, 
          y: Math.random() * 200 + 150 
        },
        size: { width: 180, height: 100 },
        color: type,
        connections: [],
      };
    }
    
    setNodes(prev => [...prev, newNode]);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNodeData>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const startConnection = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
  }, []);

  const endConnection = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const newConnection: Connection = {
        id: `${connectingFrom}-${nodeId}`,
        from: connectingFrom,
        to: nodeId,
        type: 'reference',
      };
      setConnections(prev => [...prev, newConnection]);
      
      // Update node connections
      updateNode(connectingFrom, {
        connections: [...(nodes.find(n => n.id === connectingFrom)?.connections || []), nodeId]
      });
    }
    setConnectingFrom(null);
  }, [connectingFrom, nodes, updateNode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
      setConnectingFrom(null);
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.metaKey || e.ctrlKey))) { // Middle mouse or Cmd/Ctrl+click
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const autoLayout = useCallback(() => {
    // Simple force-directed layout
    const nodesByType = nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, CanvasNodeData[]>);

    let x = 100;
    const typeSpacing = 300;
    const nodeSpacing = 120;

    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      let y = 100;
      typeNodes.forEach((node) => {
        updateNode(node.id, { position: { x, y } });
        y += nodeSpacing;
      });
      x += typeSpacing;
    });
  }, [nodes, updateNode]);

  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;
    
    return {
      from: {
        x: fromNode.position.x + fromNode.size.width / 2,
        y: fromNode.position.y + fromNode.size.height / 2,
      },
      to: {
        x: toNode.position.x + toNode.size.width / 2,
        y: toNode.position.y + toNode.size.height / 2,
      },
    };
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
      <CanvasToolbar
        onAddNode={addNode}
        onZoomIn={() => setScale(prev => Math.min(3, prev * 1.2))}
        onZoomOut={() => setScale(prev => Math.max(0.1, prev * 0.8))}
        onResetView={() => {
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }}
        onSave={() => console.log('Save canvas')}
        onExport={() => console.log('Export canvas')}
        onToggleGrid={() => setShowGrid(prev => !prev)}
        onAutoLayout={autoLayout}
        onClearCanvas={clearCanvas}
        showGrid={showGrid}
        scale={scale}
        isCollapsed={isToolbarCollapsed}
        onToggleCollapse={() => setIsToolbarCollapsed(prev => !prev)}
      />
      <div
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
            : undefined,
          backgroundSize: showGrid ? `${20 * scale}px ${20 * scale}px` : undefined,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{
            scale: scale,
            x: offset.x / scale,
            y: offset.y / scale,
          }}
          transition={{ type: "tween", duration: 0.1 }}
          style={{
            transformOrigin: '0 0',
          }}
        >
          {/* Render connections */}
          {connections.map((connection) => {
            const path = getConnectionPath(connection);
            if (!path) return null;
            
            return (
              <CanvasConnection
                key={connection.id}
                from={path.from}
                to={path.to}
                style={connection.type === 'dependency' ? 'dashed' : 'solid'}
                animated={connection.type === 'flow'}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map((node) => (
            <React.Fragment key={node.id}>
              {/* Render custom ideation nodes */}
              {node.metadata?.stage === 'ideation-discovery' && Object.values(STAGE1_NODE_TYPES).includes(node.type as any) ? (
                <>
                  {node.type === 'appName' && (
                    <AppNameNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      scale={scale}
                    />
                  )}
                  {node.type === 'tagline' && (
                    <TaglineNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      scale={scale}
                    />
                  )}
                  {node.type === 'coreProblem' && (
                    <CoreProblemNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      scale={scale}
                    />
                  )}
                  {node.type === 'mission' && (
                    <MissionNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      scale={scale}
                    />
                  )}
                  {node.type === 'userPersona' && (
                    <UserPersonaNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      onDelete={deleteNode}
                      scale={scale}
                    />
                  )}
                  {node.type === 'valueProp' && (
                    <ValuePropositionNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      scale={scale}
                    />
                  )}
                  {node.type === 'competitor' && (
                    <CompetitorNode
                      node={node as any}
                      isSelected={selectedNodeId === node.id}
                      onUpdate={updateNode}
                      onSelect={setSelectedNodeId}
                      onDelete={deleteNode}
                      scale={scale}
                    />
                  )}
                </>
              ) : (
                /* Render default canvas node for non-ideation nodes */
                <CanvasNode
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  isConnecting={connectingFrom !== null}
                  onSelect={setSelectedNodeId}
                  onUpdate={updateNode}
                  onDelete={deleteNode}
                  onStartConnection={startConnection}
                  onEndConnection={endConnection}
                  scale={scale}
                />
              )}
            </React.Fragment>
          ))}

          {/* Connection preview */}
          {connectingFrom && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
              <div className="text-sm text-blue-600 bg-blue-50 bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200">
                Click another node to create connection
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
        <div>Nodes: {nodes.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Zoom: {Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
};