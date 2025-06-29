/**
 * Node placement utilities for the SpatialCanvas system.
 * Provides semantic zones for initial node placement.
 * For auto-layout of existing nodes, see layoutUtils.ts.
 */

import { Node } from 'reactflow';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Fixed grid system - no more size-based calculations
export const GRID_SIZE = 50; // Base grid unit
export const NODE_SPACING = 80; // Fixed spacing between nodes
export const GROUP_SPACING = 200; // Spacing between different groups

// Semantic positioning zones - fixed coordinates
export const SEMANTIC_ZONES = {
  // Stage 1 - Ideation & Discovery (Left side, organized vertically)
  'appName': { x: 100, y: 100 },
  'tagline': { x: 100, y: 160 },
  'coreProblem': { x: 100, y: 280 },
  'mission': { x: 100, y: 420 },
  'valueProp': { x: 100, y: 560 },
  
  // User research cluster (right of stage 1)
  'userPersona': { x: 450, y: 150 },
  'competitor': { x: 450, y: 400 },
  'branding': { x: 700, y: 100 },
  
  // Stage 2 - Feature Planning (Far right, grouped together)
  'feature': { x: 800, y: 150 },
  'architecture': { x: 1200, y: 400 },
  'routeApiMapping': { x: 1200, y: 200 },
  
  // Technical specs (bottom area)
  'platform': { x: 100, y: 700 },
  'techStack': { x: 300, y: 700 },
  'uiStyle': { x: 500, y: 700 },
  
  // Stage 3+ (separate areas)
  'informationArchitecture': { x: 1200, y: 200 },
  'userJourney': { x: 1200, y: 400 },
  'stateDataFlow': { x: 1200, y: 600 },
  'markdownCode': { x: 1400, y: 200 },
  'lofiLayout': { x: 800, y: 500 },
  'ux-flow': { x: 1200, y: 200 },
  'system': { x: 1200, y: 400 },
  'wireframe': { x: 1200, y: 600 },
  
  // Default fallback
  'default': { x: 600, y: 300 }
};

// Grid-based positioning for multiple nodes of same type
export const GRID_LAYOUTS = {
  'userPersona': {
    baseX: 450,
    baseY: 150,
    columns: 3,
    rowSpacing: 180,
    colSpacing: 220
  },
  'competitor': {
    baseX: 450,
    baseY: 400,
    columns: 3,
    rowSpacing: 150,
    colSpacing: 200
  },
  'feature': {
    baseX: 800, // Much further right
    baseY: 150,
    columns: 2, // 2 columns for features
    rowSpacing: 200,
    colSpacing: 300
  },
  'markdownCode': {
    baseX: 1400,
    baseY: 200,
    columns: 1, // Stack vertically
    rowSpacing: 320,
    colSpacing: 0
  }
};

/**
 * Get the exact position for a node based on semantic rules
 */
export function getSmartNodePosition(
  existingNodes: Node[],
  nodeSize: Size,
  nodeType: string,
  preferredPosition?: Position,
  stageId?: string,
  isUserCreated: boolean = false
): Position {
  console.log(`Getting smart position for ${nodeType} node, isUserCreated: ${isUserCreated}`);
  
  // Handle singleton nodes (only one should exist)
  if (['appName', 'tagline', 'coreProblem', 'mission', 'valueProp'].includes(nodeType)) {
    const position = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES];
    if (position) {
      console.log(`Using singleton position for ${nodeType}: (${position.x}, ${position.y})`);
      return position;
    }
  }
  
  // Handle user-created nodes
  if (isUserCreated) {
    const userPosition = findUserCreatedPosition(existingNodes);
    console.log(`Using user-created position: (${userPosition.x}, ${userPosition.y})`);
    return userPosition;
  }
  
  // For nodes that will be laid out by ELK.js, don't use fixed preferred positions
  // unless they're explicitly user-created or singletons
  if (preferredPosition) {
    // Use the exact preferred position without random offsets
    // This gives ELK.js a consistent starting point
    console.log(`Using preferred position for ${nodeType}: (${preferredPosition.x}, ${preferredPosition.y})`);
    return preferredPosition;
  }
  
  // Fallback to semantic zone
  const semanticPosition = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] 
    || SEMANTIC_ZONES.default;
  
  console.log(`Using semantic position for ${nodeType}: (${semanticPosition.x}, ${semanticPosition.y})`);
  return semanticPosition;
}

/**
 * Find position for user-created nodes (center area)
 */
function findUserCreatedPosition(existingNodes: Node[]): Position {
  // Add some randomness to prevent exact overlaps
  return { 
    x: 600 + Math.random() * 100 - 50,
    y: 300 + Math.random() * 100 - 50
  };
}

/**
 * Get position for a group of nodes (batch creation)
 */
export function arrangeNodesInGroup(
  existingNodes: Node[],
  nodesToArrange: { id: string; size: Size }[],
  nodeType: string,
  stageId?: string,
  arrangement: 'grid' | 'circle' | 'horizontal' | 'vertical' = 'grid'
): Record<string, Position> {
  // This function is now deprecated in favor of ELK-based layout
  // For backward compatibility, return simple positions
  return nodesToArrange.reduce((acc, node, index) => {
    const basePosition = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] || SEMANTIC_ZONES.default;
    acc[node.id] = {
      x: basePosition.x + (index * NODE_SPACING),
      y: basePosition.y
    };
    return acc;
  }, {} as Record<string, Position>);
}

/**
 * Legacy compatibility functions
 */
export function checkCollision(rect1: any, rect2: any): boolean {
  const distance = Math.sqrt(
    Math.pow(rect1.x - rect2.x, 2) + 
    Math.pow(rect1.y - rect2.y, 2)
  );
  return distance < 120; // Fixed collision distance
}

export function getGroupPosition(
  existingNodes: Node[],
  nodeCount: number,
  nodeType: string,
  stageId?: string
): Position {
  return SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] || SEMANTIC_ZONES.default;
}