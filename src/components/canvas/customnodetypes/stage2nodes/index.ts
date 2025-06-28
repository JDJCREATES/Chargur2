/**
 * Stage 2 Custom Node Types Export
 * 
 * Exports all custom node types for the Feature Planning stage
 */

export { FeatureNode } from './FeatureNode';
export { ArchitectureNode } from './ArchitectureNode';

// Node type definitions for easy reference
export const STAGE2_NODE_TYPES = { 
  FEATURE: 'feature',
  ARCHITECTURE: 'architecture',
} as const;

// Default node configurations
export const STAGE2_NODE_DEFAULTS = {
  'feature': {
    size: { width: 500, height: 160 },
    position: { x: 200, y: 350 },
    editable: true,
  },
  'architecture': {
    size: { width: 400, height: 300 },
    position: { x: 700, y: 350 },
    editable: true,
  },
};