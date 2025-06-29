/**
 * nodePlacementUtils.ts
 * 
 * Utility functions for intelligent node placement on the canvas.
 * Provides collision detection and smart positioning algorithms to ensure
 * nodes are placed in a visually appealing and logical manner.
 */

import { Node } from 'reactflow';

// Define a position type for clarity
export interface Position {
  x: number;
  y: number;
}

// Define a size type for clarity
export interface Size {
  width: number;
  height: number;
}

// Define a rectangle for collision detection
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Minimum spacing between nodes
const MIN_SPACING = 30;

// Number of nodes per row for grid layouts
const NODES_PER_ROW = {
  userPersona: 5,  // 5 user personas per row
  competitor: 4,   // 4 competitors per row
  feature: 3       // 3 features per row
};

// Default canvas boundaries
const CANVAS_BOUNDS = {
  minX: -2000,
  minY: -2000,
  maxX: 4000,
  maxY: 4000
};

// Category-based positioning zones
const CATEGORY_ZONES = {
  // Ideation & Discovery nodes
  'appName': { x: 400, y: 50, radius: 120 },
  'tagline': { x: 420, y: 150, radius: 120 },
  'coreProblem': { x: 100, y: 200, radius: 120 },
  'mission': { x: 350, y: 300, radius: 150 }, // Adjusted Y and increased radius
  'userPersona': { x: 650, y: 200, radius: 200 }, // Increased radius for better spacing
  'valueProp': { x: 100, y: 500, radius: 150 }, // Adjusted Y and increased radius
  'competitor': { x: 700, y: 400, radius: 200 }, // Increased radius for better spacing
  
  // Feature Planning nodes
  'feature': { x: 400, y: 350, radius: 250 }, // Increased radius for better spacing
  
  // Structure & Flow nodes
  'ux-flow': { x: 400, y: 600, radius: 200 },
  
  // Architecture nodes
  'system': { x: 400, y: 800, radius: 200 },
  
  // Interface nodes
  'wireframe': { x: 400, y: 1000, radius: 200 },
  
  // Default/fallback zone
  'default': { x: 400, y: 400, radius: 300 }
};

// Stage-based positioning zones
const STAGE_ZONES = {
  'ideation-discovery': { x: -800, y: -600, radius: 400 },
  'feature-planning': { x: 800, y: -600, radius: 400 },
  'structure-flow': { x: -800, y: 600, radius: 400 },
  'interface-interaction': { x: 800, y: 600, radius: 400 },
  'architecture-design': { x: 0, y: -800, radius: 400 },
  'user-auth-flow': { x: 0, y: 800, radius: 400 },
  'ux-review-check': { x: -1200, y: 0, radius: 400 },
  'auto-prompt-engine': { x: 1200, y: 0, radius: 400 },
  'export-handoff': { x: 0, y: 0, radius: 400 },
  'default': { x: 0, y: 0, radius: 400 }
};

/**
 * Check if two rectangles collide
 */
export function checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Convert a node to a rectangle for collision detection
 */
function nodeToRectangle(node: Node): Rectangle {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.data.size?.width || 180,
    height: node.data.size?.height || 100
  };
}

/**
 * Check if a position is within canvas bounds
 */
function isWithinBounds(position: Position, size: Size): boolean {
  return (
    position.x >= CANVAS_BOUNDS.minX &&
    position.y >= CANVAS_BOUNDS.minY &&
    position.x + size.width <= CANVAS_BOUNDS.maxX &&
    position.y + size.height <= CANVAS_BOUNDS.maxY
  );
}

/**
 * Add a small random offset to a position to avoid perfect grid alignment
 */
function addRandomOffset(position: Position, maxOffset: number = 20): Position {
  return {
    x: position.x + (Math.random() * maxOffset * 2 - maxOffset),
    y: position.y + (Math.random() * maxOffset * 2 - maxOffset)
  };
}

/**
 * Get a position near other nodes of the same type
 */
function getPositionNearSimilarNodes(
  existingNodes: Node[],
  nodeType: string,
  size: Size
): Position | null {
  // Find nodes of the same type
  const similarNodes = existingNodes.filter(node => node.type === nodeType);
  
  if (similarNodes.length === 0) {
    return null;
  }
  
  // Calculate the center of mass for similar nodes
  const centerX = similarNodes.reduce((sum, node) => sum + node.position.x, 0) / similarNodes.length;
  const centerY = similarNodes.reduce((sum, node) => sum + node.position.y, 0) / similarNodes.length;
  
  // Find a position near the center of mass
  return {
    x: centerX + (Math.random() * 100 - 50),
    y: centerY + (Math.random() * 100 - 50)
  };
}

/**
 * Get a position based on the node's category or type
 */
function getCategoryBasedPosition(nodeType: string, stageId?: string): Position {
  // First try to get a position based on the exact node type
  const typeZone = CATEGORY_ZONES[nodeType as keyof typeof CATEGORY_ZONES];
  
  if (typeZone) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * typeZone.radius;
    return {
      x: typeZone.x + Math.cos(angle) * distance,
      y: typeZone.y + Math.sin(angle) * distance
    };
  }
  
  // If no type-specific zone, try stage-based positioning
  if (stageId) {
    const stageZone = STAGE_ZONES[stageId as keyof typeof STAGE_ZONES] || STAGE_ZONES.default;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * stageZone.radius;
    return {
      x: stageZone.x + Math.cos(angle) * distance,
      y: stageZone.y + Math.sin(angle) * distance
    };
  }
  
  // Fallback to default zone
  const defaultZone = CATEGORY_ZONES.default;
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * defaultZone.radius;
  return {
    x: defaultZone.x + Math.cos(angle) * distance,
    y: defaultZone.y + Math.sin(angle) * distance
  };
}

/**
 * Get a position relative to a related node.
 * This function implements grid-based placement for related nodes.
 */
function getRelatedNodePosition(
  existingNodes: Node[],
  newNodeType: string,
  newNodeSize: Size,
  stageId?: string
): Position | null {
  switch (newNodeType) {
    case 'mission': {
      const appNameNode = existingNodes.find(node => node.type === 'appName');
      if (appNameNode) {
        return {
          x: appNameNode.position.x,
          y: appNameNode.position.y + (appNameNode.data.size?.height || 80) + MIN_SPACING * 2
        };
      }
      break;
    }
    case 'tagline': {
      const appNameNode = existingNodes.find(node => node.type === 'appName');
      if (appNameNode) {
        return {
          x: appNameNode.position.x + 20, // Slight offset for visual interest
          y: appNameNode.position.y + (appNameNode.data.size?.height || 80) + MIN_SPACING
        };
      }
      break;
    }
    case 'valueProp': {
      const coreProblemNode = existingNodes.find(node => node.type === 'coreProblem');
      if (coreProblemNode) {
        return {
          x: coreProblemNode.position.x,
          y: coreProblemNode.position.y + (coreProblemNode.data.size?.height || 160) + MIN_SPACING * 2
        };
      }
      break;
    }
    case 'feature': {
      const featureNodes = existingNodes.filter(node => 
        node.type === 'feature' && 
        node.data?.metadata?.stage === 'feature-planning'
      );
      
      if (featureNodes.length > 0) {
        // Grid-based placement for features
        const nodesPerRow = NODES_PER_ROW.feature;
        const row = Math.floor(featureNodes.length / nodesPerRow);
        const col = featureNodes.length % nodesPerRow;
        
        const baseFeatureX = CATEGORY_ZONES.feature.x - ((nodesPerRow - 1) * (newNodeSize.width + MIN_SPACING) / 2);
        const baseFeatureY = CATEGORY_ZONES.feature.y;
        
        return {
          x: baseFeatureX + col * (newNodeSize.width + MIN_SPACING * 2),
          y: baseFeatureY + row * (newNodeSize.height + MIN_SPACING * 2)
        };
      }
      break;
    }
    case 'userPersona': {
      const personaNodes = existingNodes.filter(node => 
        node.type === 'userPersona' && 
        node.data?.metadata?.stage === 'ideation-discovery'
      );
      
      const personaCount = personaNodes.length;
      const nodesPerRow = NODES_PER_ROW.userPersona;
      const row = Math.floor(personaCount / nodesPerRow);
      const col = personaCount % nodesPerRow;

      // Center the grid around the category zone
      const basePersonaX = CATEGORY_ZONES.userPersona.x - ((nodesPerRow - 1) * (newNodeSize.width + MIN_SPACING) / 2);
      const basePersonaY = CATEGORY_ZONES.userPersona.y;
      const personaWidth = newNodeSize.width || 160;
      const personaHeight = newNodeSize.height || 140;

      return {
        x: basePersonaX + col * (personaWidth + MIN_SPACING * 2),
        y: basePersonaY + row * (personaHeight + MIN_SPACING * 2)
      };
    }
    case 'competitor': {
      const competitorNodes = existingNodes.filter(node => 
        node.type === 'competitor' && 
        node.data?.metadata?.stage === 'ideation-discovery'
      );
      
      const competitorCount = competitorNodes.length;
      const nodesPerRow = NODES_PER_ROW.competitor;
      const row = Math.floor(competitorCount / nodesPerRow);
      const col = competitorCount % nodesPerRow;

      // Center the grid around the category zone
      const baseCompetitorX = CATEGORY_ZONES.competitor.x - ((nodesPerRow - 1) * (newNodeSize.width + MIN_SPACING) / 2);
      const baseCompetitorY = CATEGORY_ZONES.competitor.y;
      const competitorWidth = newNodeSize.width || 140;
      const competitorHeight = newNodeSize.height || 100;

      return {
        x: baseCompetitorX + col * (competitorWidth + MIN_SPACING * 2),
        y: baseCompetitorY + row * (competitorHeight + MIN_SPACING * 2)
      };
    }
    case 'system': {
      if (stageId === 'architecture-design') {
        const systemNodes = existingNodes.filter(node => 
          node.type === 'system' && 
          node.data?.metadata?.stage === 'architecture-design'
        );
        
        if (systemNodes.length > 0) {
          // Grid-based placement for system nodes
          const nodesPerRow = 3;
          const row = Math.floor(systemNodes.length / nodesPerRow);
          const col = systemNodes.length % nodesPerRow;
          
          const baseSystemX = CATEGORY_ZONES.system.x - ((nodesPerRow - 1) * (newNodeSize.width + MIN_SPACING) / 2);
          const baseSystemY = CATEGORY_ZONES.system.y;
          
          return {
            x: baseSystemX + col * (newNodeSize.width + MIN_SPACING * 2),
            y: baseSystemY + row * (newNodeSize.height + MIN_SPACING * 2)
          };
        }
      };
    }
  }
  return null;
}

/**
 * Find a non-colliding position using a spiral search pattern
 */
function findNonCollidingPosition(
  startPosition: Position,
  size: Size,
  existingNodes: Node[],
  maxAttempts: number = 50
): Position {
  let position = { ...startPosition };
  let attempt = 0;
  let step = 1;
  let direction = 0; // 0: right, 1: down, 2: left, 3: up
  
  const stepSize = Math.max(size.width, size.height) + MIN_SPACING;
  
  // Create a rectangle for the new node
  const newNodeRect: Rectangle = {
    x: position.x,
    y: position.y,
    width: size.width + MIN_SPACING,
    height: size.height + MIN_SPACING
  };
  
  // Check if the initial position is valid
  let hasCollision = existingNodes.some(node => 
    checkCollision(newNodeRect, nodeToRectangle(node))
  );
  
  // If no collision and within bounds, return the initial position
  if (!hasCollision && isWithinBounds(position, size)) {
    return position;
  }
  
  // Spiral search pattern
  while (attempt < maxAttempts) {
    attempt++;
    
    // Move in the current direction
    switch (direction) {
      case 0: // right
        position.x += stepSize;
        break;
      case 1: // down
        position.y += stepSize;
        break;
      case 2: // left
        position.x -= stepSize;
        break;
      case 3: // up
        position.y -= stepSize;
        break;
    }
    
    // Update the rectangle position
    newNodeRect.x = position.x;
    newNodeRect.y = position.y;
    
    // Check for collisions
    hasCollision = existingNodes.some(node => 
      checkCollision(newNodeRect, nodeToRectangle(node))
    );
    
    // If no collision and within bounds, return the position
    if (!hasCollision && isWithinBounds(position, size)) {
      // Add a small random offset to avoid perfect grid alignment
      return addRandomOffset(position, 10);
    }
    
    // Change direction after completing steps
    if (attempt % 2 === 0) {
      direction = (direction + 1) % 4;
      step++;
    }
  }
  
  // If we couldn't find a non-colliding position, return the original with a random offset
  console.warn('Could not find non-colliding position after', maxAttempts, 'attempts');
  return addRandomOffset(startPosition, 50);
}

/**
 * Get a smart position for a new node based on its type, existing nodes, and other factors
 */
export function getSmartNodePosition(
  existingNodes: Node[],
  nodeSize: Size,
  nodeType: string,
  preferredPosition?: Position,
  stageId?: string,
  isUserCreated: boolean = false
): Position {
  // If a preferred position is provided, try to use it first
  // First check if we have a related node position
  const relatedPosition = getRelatedNodePosition(existingNodes, nodeType, nodeSize, stageId);
  
  if (relatedPosition) {
    // Check if the related position would cause a collision
    const newNodeRect: Rectangle = {
      x: relatedPosition.x,
      y: relatedPosition.y,
      width: nodeSize.width + MIN_SPACING,
      height: nodeSize.height + MIN_SPACING
    };
    
    const hasCollision = existingNodes.some(node => 
      checkCollision(newNodeRect, nodeToRectangle(node))
    );
    
    // If no collision, use the related position
    if (!hasCollision && isWithinBounds(relatedPosition, nodeSize)) {
      return relatedPosition;
    }
    
    // Otherwise, find a non-colliding position starting from the related position
    return findNonCollidingPosition(relatedPosition, nodeSize, existingNodes);
  }
  else if (preferredPosition) {
    // Check if the preferred position would cause a collision
    const newNodeRect: Rectangle = {
      x: preferredPosition.x,
      y: preferredPosition.y,
      width: nodeSize.width + MIN_SPACING,
      height: nodeSize.height + MIN_SPACING
    };
    
    const hasCollision = existingNodes.some(node => 
      checkCollision(newNodeRect, nodeToRectangle(node))
    );
    
    // If no collision, use the preferred position
    if (!hasCollision && isWithinBounds(preferredPosition, nodeSize)) {
      return preferredPosition;
    }
    
    // Otherwise, find a non-colliding position starting from the preferred position
    return findNonCollidingPosition(preferredPosition, nodeSize, existingNodes);
  }
  
  // For user-created nodes, try to place them in the center of the visible area
  if (isUserCreated) {
    const centerPosition = {
      x: 400, // Assuming the canvas center is around 400
      y: 300  // Assuming the canvas center is around 300
    };
    
    return findNonCollidingPosition(centerPosition, nodeSize, existingNodes);
  }
  
  // Try to find a position near similar nodes
  const nearSimilarPosition = getPositionNearSimilarNodes(existingNodes, nodeType, nodeSize);
  if (nearSimilarPosition) {
    return findNonCollidingPosition(nearSimilarPosition, nodeSize, existingNodes);
  }
  
  // Get a position based on the node's category or type
  const categoryPosition = getCategoryBasedPosition(nodeType, stageId);
  return findNonCollidingPosition(categoryPosition, nodeSize, existingNodes);
}

/**
 * Get a position for a group of related nodes
 */
export function getGroupPosition(
  existingNodes: Node[],
  nodeCount: number,
  nodeType: string, 
  stageId?: string
): Position {
  // Get a base position for the group
  const basePosition = getCategoryBasedPosition(nodeType, stageId);
  
  // For certain node types, use grid-based positioning
  if (nodeType === 'userPersona' || nodeType === 'competitor' || nodeType === 'feature') {
    const nodesPerRow = NODES_PER_ROW[nodeType as keyof typeof NODES_PER_ROW] || 3;
    
    // Calculate the width of the entire grid
    let nodeWidth = 160; // Default width
    if (nodeType === 'competitor') nodeWidth = 140;
    if (nodeType === 'feature') nodeWidth = 300;
    
    const gridWidth = Math.min(nodeCount, nodesPerRow) * (nodeWidth + MIN_SPACING * 2);
    
    return {
      x: basePosition.x - (gridWidth / 2) + (nodeWidth / 2),
      y: basePosition.y
    };
  } else {
    // Default behavior for other node types
    return {
      x: basePosition.x - (nodeCount * 20),
      y: basePosition.y - (nodeCount * 10)
    };
  }
}

/**
 * Calculate positions for a collection of nodes that should be arranged together
 */
export function arrangeNodesInGroup(
  existingNodes: Node[],
  nodesToArrange: { id: string; size: Size }[],
  nodeType: string,
  stageId?: string,
  arrangement: 'grid' | 'circle' | 'horizontal' | 'vertical' = 'grid'
): Record<string, Position> {
  // Get a base position for the group using the enhanced group position logic
  const basePosition = getGroupPosition(existingNodes, nodesToArrange.length, nodeType, stageId);
  
  // Create a map to store the positions
  const positions: Record<string, Position> = {};
  
  // Arrange nodes based on the specified arrangement
  switch (arrangement) {
    case 'grid': {
      // Calculate grid dimensions
      const cols = nodeType === 'userPersona' ? NODES_PER_ROW.userPersona :
                  nodeType === 'competitor' ? NODES_PER_ROW.competitor :
                  nodeType === 'feature' ? NODES_PER_ROW.feature :
                  Math.ceil(Math.sqrt(nodesToArrange.length));
      const spacing = MIN_SPACING * 2;
      
      nodesToArrange.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        // Center the grid around the base position
        const gridWidth = Math.min(nodesToArrange.length, cols) * (node.size.width + spacing);
        const gridOffsetX = (gridWidth / 2) - (node.size.width / 2);
        
        positions[node.id] = {
          x: basePosition.x + col * (node.size.width + spacing) - gridOffsetX,
          y: basePosition.y + row * (node.size.height + spacing)
        };
      });
      break;
    }
    
    case 'circle': {
      const radius = 150;
      const angleStep = (2 * Math.PI) / nodesToArrange.length;
      
      nodesToArrange.forEach((node, index) => {
        const angle = index * angleStep;
        
        positions[node.id] = {
          x: basePosition.x + Math.cos(angle) * radius - node.size.width / 2,
          y: basePosition.y + Math.sin(angle) * radius - node.size.height / 2
        };
      });
      break;
    }
    
    case 'horizontal': {
      const spacing = 20;
      
      nodesToArrange.forEach((node, index) => {
        positions[node.id] = {
          x: basePosition.x + index * (node.size.width + spacing),
          y: basePosition.y
        };
      });
      break;
    }
    
    case 'vertical': {
      const spacing = 20;
      
      nodesToArrange.forEach((node, index) => {
        positions[node.id] = {
          x: basePosition.x,
          y: basePosition.y + index * (node.size.height + spacing)
        };
      });
      break;
    }
  }
  
  // Check for collisions and adjust if needed
  for (const nodeId in positions) {
    const nodeToArrange = nodesToArrange.find(n => n.id === nodeId);
    if (!nodeToArrange) continue;
    
    const position = positions[nodeId];
    const size = nodeToArrange.size;
    
    // Create a rectangle for collision detection
    const rect: Rectangle = {
      x: position.x,
      y: position.y,
      width: size.width + MIN_SPACING,
      height: size.height + MIN_SPACING
    };
    
    // Check for collisions with existing nodes
    const hasCollision = existingNodes.some(node => 
      checkCollision(rect, nodeToRectangle(node))
    );
    
    // If there's a collision, find a non-colliding position
    if (hasCollision) {
      positions[nodeId] = findNonCollidingPosition(position, size, existingNodes);
    }
  }
  
  return positions;
}