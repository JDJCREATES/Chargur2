/**
 * Stage 2 Custom Node Types Export
 * 
 * Exports all custom node types for the Feature Planning stage
 */

export { FeatureNode } from './FeatureNode';

// Node type definitions for easy reference
export const STAGE2_NODE_TYPES = { 
  FEATURE: 'feature',
} as const;

// Default node configurations
export const STAGE2_NODE_DEFAULTS = {
  'feature': {
    size: { width: 500, height: 160 },
    position: { x: 200, y: 350 },
    editable: true,
  },
};