/**
 * Production-ready node placement system
 * Uses fixed grid-based positioning with semantic grouping
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
const GRID_SIZE = 50; // Base grid unit
const NODE_SPACING = 80; // Fixed spacing between nodes
const GROUP_SPACING = 200; // Spacing between different groups

// Semantic positioning zones - fixed coordinates
const SEMANTIC_ZONES = {
  // Stage 1 - Ideation & Discovery (Left side, organized vertically)
  'appName': { x: 100, y: 100 },
  'tagline': { x: 100, y: 160 }, // Moved up slightly from 200
  'coreProblem': { x: 100, y: 280 }, // More spacing from tagline
  'mission': { x: 100, y: 420 }, // More spacing
  'valueProp': { x: 100, y: 560 }, // More spacing
  
  // User research cluster (right of stage 1)
  'userPersona': { x: 450, y: 150 }, // Base position for first persona
  'competitor': { x: 450, y: 400 }, // Base position for first competitor
  
  // Stage 2 - Feature Planning (Far right, grouped together)
  'feature': { x: 800, y: 150 }, // Much further right, grouped together
  
  // Technical specs (bottom area)
  'platform': { x: 100, y: 700 },
  'techStack': { x: 300, y: 700 },
  'uiStyle': { x: 500, y: 700 },
  
  // Stage 3+ (separate areas)
  'ux-flow': { x: 1200, y: 200 },
  'system': { x: 1200, y: 400 },
  'wireframe': { x: 1200, y: 600 },
  'lofiLayout': { x: 800, y: 500 },
  
  // Default fallback
  'default': { x: 600, y: 300 }
};

// Grid-based positioning for multiple nodes of same type
const GRID_LAYOUTS = {
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
  console.log(`Positioning ${nodeType} node`);
  
  // Handle singleton nodes (only one should exist)
  if (['appName', 'tagline', 'coreProblem', 'mission', 'valueProp'].includes(nodeType)) {
    const position = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES];
    if (position) {
      console.log(`Singleton ${nodeType} positioned at:`, position);
      return position;
    }
  }
  
  // Handle multi-instance nodes with grid layout
  if (['userPersona', 'competitor', 'feature'].includes(nodeType)) {
    return getGridPosition(existingNodes, nodeType);
  }
  
  // Handle user-created nodes
  if (isUserCreated) {
    return findUserCreatedPosition(existingNodes);
  }
  
  // Handle preferred position with collision avoidance
  if (preferredPosition) {
    return findNearestFreePosition(preferredPosition, existingNodes);
  }
  
  // Fallback to semantic zone
  const semanticPosition = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] 
    || SEMANTIC_ZONES.default;
  
  return findNearestFreePosition(semanticPosition, existingNodes);
}

/**
 * Grid-based positioning for multi-instance nodes
 */
function getGridPosition(existingNodes: Node[], nodeType: string): Position {
  const layout = GRID_LAYOUTS[nodeType as keyof typeof GRID_LAYOUTS];
  if (!layout) {
    return SEMANTIC_ZONES.default;
  }
  
  // Count existing nodes of this type
  const existingCount = existingNodes.filter(node => node.type === nodeType).length;
  
  // Calculate grid position
  const row = Math.floor(existingCount / layout.columns);
  const col = existingCount % layout.columns;
  
  const position = {
    x: layout.baseX + (col * layout.colSpacing),
    y: layout.baseY + (row * layout.rowSpacing)
  };
  
  console.log(`Grid position for ${nodeType} #${existingCount}:`, position);
  return position;
}

/**
 * Find position for user-created nodes (center area)
 */
function findUserCreatedPosition(existingNodes: Node[]): Position {
  const centerArea = { x: 600, y: 300 };
  return findNearestFreePosition(centerArea, existingNodes);
}

/**
 * Find the nearest free position to avoid overlaps
 */
function findNearestFreePosition(targetPosition: Position, existingNodes: Node[]): Position {
  const COLLISION_RADIUS = 120; // Minimum distance between nodes
  
  // Check if target position is free
  if (isPositionFree(targetPosition, existingNodes, COLLISION_RADIUS)) {
    return targetPosition;
  }
  
  // Spiral search for free position
  const maxAttempts = 20;
  const spiralStep = 60;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const radius = attempt * spiralStep;
    const positions = getCircularPositions(targetPosition, radius, 8); // 8 positions per circle
    
    for (const position of positions) {
      if (isPositionFree(position, existingNodes, COLLISION_RADIUS)) {
        console.log(`Found free position after ${attempt} attempts:`, position);
        return position;
      }
    }
  }
  
  // Fallback: add random offset
  return {
    x: targetPosition.x + Math.random() * 200 - 100,
    y: targetPosition.y + Math.random() * 200 - 100
  };
}

/**
 * Check if a position is free of collisions
 */
function isPositionFree(position: Position, existingNodes: Node[], minDistance: number): boolean {
  return !existingNodes.some(node => {
    const distance = Math.sqrt(
      Math.pow(node.position.x - position.x, 2) + 
      Math.pow(node.position.y - position.y, 2)
    );
    return distance < minDistance;
  });
}

/**
 * Get positions in a circle around a center point
 */
function getCircularPositions(center: Position, radius: number, count: number): Position[] {
  const positions: Position[] = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    positions.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  
  return positions;
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
  const positions: Record<string, Position> = {};
  
  if (GRID_LAYOUTS[nodeType as keyof typeof GRID_LAYOUTS]) {
    // Use grid layout for supported types
    const layout = GRID_LAYOUTS[nodeType as keyof typeof GRID_LAYOUTS];
    const startIndex = existingNodes.filter(n => n.type === nodeType).length;
    
    nodesToArrange.forEach((node, index) => {
      const totalIndex = startIndex + index;
      const row = Math.floor(totalIndex / layout.columns);
      const col = totalIndex % layout.columns;
      
      positions[node.id] = {
        x: layout.baseX + (col * layout.colSpacing),
        y: layout.baseY + (row * layout.rowSpacing)
      };
    });
  } else {
    // Fallback to simple arrangement
    const basePosition = SEMANTIC_ZONES[nodeType as keyof typeof SEMANTIC_ZONES] || SEMANTIC_ZONES.default;
    
    nodesToArrange.forEach((node, index) => {
      positions[node.id] = {
        x: basePosition.x + (index * NODE_SPACING),
        y: basePosition.y
      };
    });
  }
  
  return positions;
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