/**
 * Stage 1 Custom Node Types Export
 * 
 * Exports all custom node types for the Ideation & Discovery stage
 */

export { AppNameNode } from './AppNameNode';
export { TaglineNode } from './TaglineNode';
export { CoreProblemNode } from './CoreProblemNode';
export { MissionNode } from './MissionNode';
export { UserPersonaNode } from './UserPersonaNode';
export { ValuePropositionNode } from './ValuePropositionNode';
export { CompetitorNode } from './CompetitorNode';

// Node type definitions for easy reference
export const STAGE1_NODE_TYPES = {
  APP_NAME: 'appName',
  TAGLINE: 'tagline',
  CORE_PROBLEM: 'coreProblem',
  MISSION: 'mission',
  USER_PERSONA: 'userPersona',
  VALUE_PROPOSITION: 'valueProp',
  COMPETITOR: 'competitor',
} as const;

// Default node configurations
export const STAGE1_NODE_DEFAULTS = {
  appName: {
    size: { width: 280, height: 80 },
    position: { x: 400, y: 50 },
    editable: true,
  },
  tagline: {
    size: { width: 240, height: 40 },
    position: { x: 420, y: 150 },
    editable: true,
  },
  coreProblem: {
    size: { width: 220, height: 160 },
    position: { x: 100, y: 200 },
    editable: true,
  },
  mission: {
    size: { width: 260, height: 140 },
    position: { x: 350, y: 220 },
    editable: true,
  },
  userPersona: {
    size: { width: 160, height: 140 },
    position: { x: 650, y: 200 },
    editable: true,
  },
  valueProp: {
    size: { width: 240, height: 180 },
    position: { x: 100, y: 400 },
    editable: true,
  },
  competitor: {
    size: { width: 140, height: 100 },
    position: { x: 700, y: 400 },
    editable: true,
  },
};