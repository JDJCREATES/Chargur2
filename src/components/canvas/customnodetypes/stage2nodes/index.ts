/**
 * Stage 2 Custom Node Types Export
 * 
 * Exports all custom node types for the Feature Planning stage
 */

export { FeatureBreakdownNode } from './FeatureBreakdownNode';

// Node type definitions for easy reference
export const STAGE2_NODE_TYPES = {
  FEATURE_BREAKDOWN: 'feature-breakdown',
} as const;

// Default node configurations
export const STAGE2_NODE_DEFAULTS = {
  'feature-breakdown': {
    size: { width: 280, height: 160 },
    position: { x: 400, y: 350 },
    editable: true,
  },
};