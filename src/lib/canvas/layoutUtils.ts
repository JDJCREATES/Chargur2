/**
 * layoutUtils.ts
 * 
 * Utilities for automatic layout of nodes in the SpatialCanvas.
 * Uses ELK.js to calculate optimal node positions based on connections.
 */

import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { SEMANTIC_ZONES } from './nodePlacementUtils';

// Initialize ELK instance
const elk = new ELK();

// Default layout options
const DEFAULT_LAYOUT_OPTIONS = {
  'algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
};

// Layout options by stage
const STAGE_LAYOUT_OPTIONS: Record<string, any> = {
  'ideation-discovery': {
    'algorithm': 'stress',
    'elk.padding': '[top=50, left=50, bottom=50, right=50]',
    'stress.desiredEdgeLength': '150'
  },
  'feature-planning': {
    'algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '100'
  },
  'structure-flow': {
    'algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '80'
  },
  'interface-interaction': {
    'algorithm': 'force',
    'elk.force.repulsion': '2',
    'elk.force.attraction': '0.1'
  },
  'architecture-design': {
    'algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '100'
  },
  'user-auth-flow': {
    'algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '80'
  }
};

/**
 * Convert ReactFlow nodes to ELK nodes
 */
function toElkNodes(nodes: Node[]): ElkNode[] {
  return nodes.map(node => ({
    id: node.id,
    width: node.data?.size?.width || 150,
    height: node.data?.size?.height || 100,
    x: node.position.x,
    y: node.position.y,
    // Add metadata for later reference
    layoutOptions: {
      'nodeType': node.type,
      'nodeStage': node.data?.metadata?.stage || 'unknown'
    }
  }));
}

/**
 * Convert ReactFlow edges to ELK edges
 */
function toElkEdges(edges: Edge[]): ElkExtendedEdge[] {
  return edges.map(edge => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target]
  }));
}

/**
 * Apply ELK layout to nodes
 */
export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  stageId?: string,
  options: Record<string, any> = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  try {
    console.log(`🔄 Running ELK layout for ${nodes.length} nodes and ${edges.length} edges`);
    
    // Get stage-specific layout options or use defaults
    const layoutOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      ...(stageId && STAGE_LAYOUT_OPTIONS[stageId] ? STAGE_LAYOUT_OPTIONS[stageId] : {}),
      ...options
    };
    
    console.log(`📊 Using layout options:`, layoutOptions);

    // Group nodes by stage for better organization
    const nodesByStage: Record<string, Node[]> = {};
    nodes.forEach(node => {
      const stage = node.data?.metadata?.stage || 'unknown';
      if (!nodesByStage[stage]) {
        nodesByStage[stage] = [];
      }
      nodesByStage[stage].push(node);
    });

    // Create ELK graph with children for each stage
    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions,
      children: [],
      edges: toElkEdges(edges)
    };

    // Add nodes grouped by stage
    Object.entries(nodesByStage).forEach(([stage, stageNodes]) => {
      elkGraph.children!.push({
        id: `stage-${stage}`,
        layoutOptions: {
          'algorithm': STAGE_LAYOUT_OPTIONS[stage]?.algorithm || layoutOptions.algorithm,
          'padding': '50'
        },
        children: toElkNodes(stageNodes)
      });
    });

    // Calculate layout
    const layoutedGraph = await elk.layout(elkGraph);

    // Apply the layout to the nodes
    const layoutedNodes = [...nodes];
    
    // Process the layout results
    if (layoutedGraph.children) {
      layoutedGraph.children.forEach(stageGroup => {
        if (stageGroup.children) {
          stageGroup.children.forEach(elkNode => {
            const nodeIndex = layoutedNodes.findIndex(n => n.id === elkNode.id);
            if (nodeIndex !== -1 && elkNode.x !== undefined && elkNode.y !== undefined) {
              // Update node position
              layoutedNodes[nodeIndex] = {
                ...layoutedNodes[nodeIndex],
                position: {
                  x: elkNode.x,
                  y: elkNode.y
                }
              };
            }
          });
        }
      });
    }

    console.log(`✅ ELK layout completed successfully`);
    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('❌ Error applying ELK layout:', error);
    
    // Fallback to simple grid layout if ELK fails
    return applyFallbackLayout(nodes, edges);
  }
}

/**
 * Apply a simple grid layout as fallback
 */
function applyFallbackLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  console.log('⚠️ Using fallback grid layout');
  
  try {
    const nodesByType: Record<string, Node[]> = {};
    
    // Group nodes by type
    nodes.forEach(node => {
      const type = node.type || 'default';
      if (!nodesByType[type]) {
        nodesByType[type] = [];
      }
      nodesByType[type].push(node);
    });
    
    const layoutedNodes = [...nodes];
    let x = 100;
    
    // Position each group of nodes
    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      let y = 100;
      const nodeSpacing = 150;
      
      typeNodes.forEach(node => {
        const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          layoutedNodes[nodeIndex] = {
            ...layoutedNodes[nodeIndex],
            position: { x, y }
          };
          y += nodeSpacing;
        }
      });
      
      x += 300; // Space between different node types
    });
    
    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('❌ Error applying fallback layout:', error);
    // Return original nodes and edges if fallback fails
    return { nodes, edges };
  }
}

/**
 * Apply a force-directed layout
 */
export async function applyForceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: Record<string, any> = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const forceOptions = {
    'algorithm': 'force',
    'elk.force.iterations': '300',
    'elk.force.repulsion': '2',
    'elk.force.attraction': '0.1',
    ...options
  };
  
  return getLayoutedElements(nodes, edges, undefined, forceOptions);
}

/**
 * Apply a hierarchical layout
 */
export async function applyHierarchicalLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN',
  options: Record<string, any> = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const hierarchicalOptions = {
    'algorithm': 'layered',
    'elk.direction': direction,
    'elk.spacing.nodeNode': '80',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    ...options
  };
  
  return getLayoutedElements(nodes, edges, undefined, hierarchicalOptions);
}

/**
 * Apply a radial layout
 */
export async function applyRadialLayout(
  nodes: Node[],
  edges: Edge[],
  options: Record<string, any> = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const radialOptions = {
    'algorithm': 'radial',
    'elk.radial.radius': '300',
    ...options
  };
  
  return getLayoutedElements(nodes, edges, undefined, radialOptions);
}

/**
 * Apply a stage-specific layout
 */
export async function applyStageLayout(
  nodes: Node[],
  edges: Edge[],
  stageId: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  return getLayoutedElements(nodes, edges, stageId);
}

/**
 * Get initial position for a new node based on semantic zones
 */
export function getInitialNodePosition(nodeType: string, stageId?: string): { x: number; y: number } {
  // Use semantic zones from nodePlacementUtils if available
  if (nodeType in SEMANTIC_ZONES) {
    return { ...SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] };
  }
  
  // Fallback to stage-based positioning
  if (stageId) {
    switch (stageId) {
      case 'ideation-discovery':
        return { x: 100, y: 100 };
      case 'feature-planning':
        return { x: 500, y: 100 };
      case 'structure-flow':
        return { x: 100, y: 400 };
      case 'interface-interaction':
        return { x: 500, y: 400 };
      case 'architecture-design':
        return { x: 100, y: 700 };
      case 'user-auth-flow':
        return { x: 500, y: 700 };
      default:
        return { x: 300, y: 300 };
    }
  }
  
  // Default position
  return { x: 300, y: 300 };
}