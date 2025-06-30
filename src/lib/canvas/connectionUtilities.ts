/**
 * connectionUtilities.ts
 * 
 * Utilities for handling node connections in the SpatialCanvas.
 * Provides functions for styling edges, generating labels, and managing connection data.
 */

import { Node, Edge, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Edge style options based on node types
 */
export interface EdgeStyle {
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
  markerEnd?: {
    type: MarkerType;
    color?: string;
  };
}

/**
 * Get edge style based on source and target node types
 */
export function getEdgeStyle(sourceNode?: Node, targetNode?: Node): EdgeStyle {
  // Default style
  const defaultStyle: EdgeStyle = {
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#9CA3AF', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow }
  };

  if (!sourceNode || !targetNode) {
    return defaultStyle;
  }

  // Feature to Feature connections (dependencies)
  if (sourceNode.type === 'feature' && targetNode.type === 'feature') {
    const dependencyType = getDependencyType(sourceNode, targetNode);
    
    switch (dependencyType) {
      case 'requires':
        return {
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.Arrow, color: '#ef4444' }
        };
      case 'enhances':
        return {
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.Arrow, color: '#10b981' }
        };
      case 'conflicts':
        return {
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.Arrow, color: '#f97316' }
        };
      default:
        return {
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.Arrow, color: '#3b82f6' }
        };
    }
  }

  // User Persona to Feature connections
  if (sourceNode.type === 'userPersona' && targetNode.type === 'feature') {
    return {
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 3 },
      markerEnd: { type: MarkerType.Arrow, color: '#10b981' }
    };
  }

  // Core Problem to Feature connections
  if (sourceNode.type === 'coreProblem' && targetNode.type === 'feature') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#f59e0b', strokeWidth: 3 },
      markerEnd: { type: MarkerType.Arrow, color: '#f59e0b' }
    };
  }

  // Core Problem to Value Proposition connections
  if (sourceNode.type === 'coreProblem' && targetNode.type === 'valueProp') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#10b981', strokeWidth: 3 },
      markerEnd: { type: MarkerType.Arrow, color: '#10b981' }
    };
  }

  // App Name to Tagline connections
  if (sourceNode.type === 'appName' && targetNode.type === 'tagline') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#8b5cf6' }
    };
  }

  // Mission to Feature connections
  if (sourceNode.type === 'mission' && targetNode.type === 'feature') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#10b981' }
    };
  }

  // Architecture to Feature connections
  if ((sourceNode.type === 'architecture' && targetNode.type === 'feature') ||
      (sourceNode.type === 'feature' && targetNode.type === 'architecture')) {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#6366f1' }
    };
  }

  // Information Architecture to User Journey connections
  if ((sourceNode.type === 'informationArchitecture' && targetNode.type === 'userJourney') ||
      (sourceNode.type === 'userJourney' && targetNode.type === 'informationArchitecture')) {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#8b5cf6' }
    };
  }

  // State Data Flow to Architecture connections
  if ((sourceNode.type === 'stateDataFlow' && targetNode.type === 'architecture') ||
      (sourceNode.type === 'architecture' && targetNode.type === 'stateDataFlow')) {
    return {
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#ef4444' }
    };
  }

  // Competitor to Value Proposition connections
  if (sourceNode.type === 'competitor' && targetNode.type === 'valueProp') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '3,3' },
      markerEnd: { type: MarkerType.Arrow, color: '#ef4444' }
    };
  }

  // Tech Stack to Feature connections
  if (sourceNode.type === 'techStack' && targetNode.type === 'feature') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#6366f1' }
    };
  }

  // Platform to Feature connections
  if (sourceNode.type === 'platform' && targetNode.type === 'feature') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#3b82f6' }
    };
  }

  // UI Style to Interface connections
  if (sourceNode.type === 'uiStyle' && targetNode.type === 'wireframe') {
    return {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#ec4899', strokeWidth: 2 },
      markerEnd: { type: MarkerType.Arrow, color: '#ec4899' }
    };
  }

  return defaultStyle;
}

/**
 * Generate a label for the connection based on source and target node types
 */
export function generateConnectionLabel(sourceNode?: Node, targetNode?: Node): string | undefined {
  if (!sourceNode || !targetNode) {
    return undefined;
  }

  // User Persona to Feature connections
  if (sourceNode.type === 'userPersona' && targetNode.type === 'feature') {
    return 'needs';
  }

  // Feature to Feature connections (dependencies)
  if (sourceNode.type === 'feature' && targetNode.type === 'feature') {
    const dependencyType = getDependencyType(sourceNode, targetNode);
    return dependencyType || 'depends on';
  }

  // Core Problem to Feature connections
  if (sourceNode.type === 'coreProblem' && targetNode.type === 'feature') {
    return 'solved by';
  }

  // Core Problem to Value Proposition connections
  if (sourceNode.type === 'coreProblem' && targetNode.type === 'valueProp') {
    return 'addressed by';
  }

  // App Name to Tagline connections
  if (sourceNode.type === 'appName' && targetNode.type === 'tagline') {
    return 'described by';
  }

  // Mission to Feature connections
  if (sourceNode.type === 'mission' && targetNode.type === 'feature') {
    return 'achieved by';
  }

  // Architecture to Feature connections
  if (sourceNode.type === 'architecture' && targetNode.type === 'feature') {
    return 'implements';
  }
  if (sourceNode.type === 'feature' && targetNode.type === 'architecture') {
    return 'implemented by';
  }

  // Information Architecture to User Journey connections
  if (sourceNode.type === 'informationArchitecture' && targetNode.type === 'userJourney') {
    return 'supports';
  }
  if (sourceNode.type === 'userJourney' && targetNode.type === 'informationArchitecture') {
    return 'navigates';
  }

  // State Data Flow to Architecture connections
  if (sourceNode.type === 'stateDataFlow' && targetNode.type === 'architecture') {
    return 'manages';
  }
  if (sourceNode.type === 'architecture' && targetNode.type === 'stateDataFlow') {
    return 'structured by';
  }

  // Competitor to Value Proposition connections
  if (sourceNode.type === 'competitor' && targetNode.type === 'valueProp') {
    return 'compared to';
  }

  // Tech Stack to Feature connections
  if (sourceNode.type === 'techStack' && targetNode.type === 'feature') {
    return 'enables';
  }

  // Platform to Feature connections
  if (sourceNode.type === 'platform' && targetNode.type === 'feature') {
    return 'hosts';
  }

  // UI Style to Interface connections
  if (sourceNode.type === 'uiStyle' && targetNode.type === 'wireframe') {
    return 'styles';
  }

  return undefined;
}


/**
 * Get the dependency type between two feature nodes
 */
export function getDependencyType(sourceNode: Node, targetNode: Node): string | undefined {
  if (sourceNode.type !== 'feature' || targetNode.type !== 'feature') {
    return undefined;
  }

  // Check if there's a dependency defined in the source node's data
  const dependencies = sourceNode.data?.dependencies || [];
  const dependency = dependencies.find((dep: any) => dep.dependsOn === targetNode.id);

  if (dependency) {
    return dependency.type; // 'requires', 'enhances', or 'conflicts'
  }

  // Check if there's a dependency defined in feature metadata
  if (sourceNode.data?.metadata?.sourceId && targetNode.data?.metadata?.sourceId) {
    const sourceId = sourceNode.data.metadata.sourceId;
    const targetId = targetNode.data.metadata.sourceId;
    
    // Check if there's a dependency in the feature data
    const featureDependencies = sourceNode.data?.featureDependencies || [];
    const featureDependency = featureDependencies.find((dep: any) => 
      dep.featureId === sourceId && dep.dependsOn === targetId
    );
    
    if (featureDependency) {
      return featureDependency.type;
    }
  }

  return undefined;
}

/**
 * Check if a connection already exists between two nodes
 */
export function connectionExists(edges: Edge[], sourceId: string, targetId: string): boolean {
  return edges.some(edge => 
    (edge.source === sourceId && edge.target === targetId) ||
    (edge.source === targetId && edge.target === sourceId)
  );
}

/**
 * Generate a unique ID for an edge
 */
export function getUniqueEdgeId(sourceId: string, targetId: string): string {
  return `edge-${sourceId}-${targetId}-${uuidv4().substring(0, 8)}`;
}

/**
 * Update nodes with connection data
 */
export function updateNodesWithConnection(
  nodes: Node[],
  sourceId: string,
  targetId: string
): Node[] {
  return nodes.map(node => {
    if (node.id === sourceId) {
      // Update source node with outgoing connection
      const connections = [...(node.data?.connections || [])];
      if (!connections.includes(targetId)) {
        connections.push(targetId);
      }
      return {
        ...node,
        data: {
          ...node.data,
          connections
        }
      };
    }
    
    if (node.id === targetId) {
      // Update target node with incoming connection
      const incomingConnections = [...(node.data?.incomingConnections || [])];
      if (!incomingConnections.includes(sourceId)) {
        incomingConnections.push(sourceId);
      }
      return {
        ...node,
        data: {
          ...node.data,
          incomingConnections
        }
      };
    }
    
    return node;
  });
}

/**
 * Clean up node connections when a node is deleted
 */
export function cleanupNodeConnections(
  nodes: Node[],
  edges: Edge[],
  nodeId: string
): { updatedNodes: Node[], updatedEdges: Edge[] } {
  // Remove edges connected to the deleted node
  const updatedEdges = edges.filter(edge => 
    edge.source !== nodeId && edge.target !== nodeId
  );
  
  // Clean up connection references in other nodes
  const updatedNodes = nodes
    .filter(node => node.id !== nodeId) // Remove the deleted node
    .map(node => {
      const connections = (node.data?.connections || []).filter((id: string) => id !== nodeId);
      const incomingConnections = (node.data?.incomingConnections || []).filter((id: string) => id !== nodeId);
      
      // Only update if connections changed
      if (connections.length !== (node.data?.connections || []).length ||
          incomingConnections.length !== (node.data?.incomingConnections || []).length) {
        return {
          ...node,
          data: {
            ...node.data,
            connections,
            incomingConnections
          }
        };
      }
      
      return node;
    });
  
  return { updatedNodes, updatedEdges };
}

/**
 * Create a new edge with appropriate style and label
 */
export function createEdge(
  sourceId: string,
  targetId: string,
  sourceNode?: Node,
  targetNode?: Node
): Edge {
  const edgeStyle = getEdgeStyle(sourceNode, targetNode);
  const label = generateConnectionLabel(sourceNode, targetNode);
  
  return {
    id: getUniqueEdgeId(sourceId, targetId),
    source: sourceId,
    target: targetId,
    type: edgeStyle.type,
    animated: edgeStyle.animated,
    style: edgeStyle.style,
    markerEnd: edgeStyle.markerEnd,
    label,
    labelStyle: { fill: edgeStyle.style.stroke, fontWeight: 500, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 }
  };
}