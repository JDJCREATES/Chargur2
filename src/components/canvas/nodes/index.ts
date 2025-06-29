/**
 * Export all custom node components for React Flow
 */

import DefaultNode from './DefaultNode';
import AppNameNode from './AppNameNode';
import TaglineNode from './TaglineNode';
import CoreProblemNode from './CoreProblemNode';
import MissionNode from './MissionNode';
import ValuePropositionNode from './ValuePropositionNode';
import UserPersonaNode from './UserPersonaNode';
import CompetitorNode from './CompetitorNode';
import PlatformNode from './PlatformNode';
import TechStackNode from './TechStackNode';
import UIStyleNode from './UIStyleNode';
import FeatureNode from './FeatureNode';
import ArchitectureNode from './ArchitectureNode';
import InformationArchitectureNode from './InformationArchitectureNode';
import UserJourneyNode from './UserJourneyNode';
import StateDataFlowNode from './StateDataFlowNode';
import MarkdownCodeNode from './MarkdownCodeNode';

// Export all node components
export {
  DefaultNode,
  AppNameNode,
  TaglineNode,
  CoreProblemNode,
  MissionNode,
  ValuePropositionNode,
  UserPersonaNode,
  CompetitorNode,
  PlatformNode,
  TechStackNode,
  UIStyleNode,
  FeatureNode,
  ArchitectureNode,
  InformationArchitectureNode,
  UserJourneyNode,
  StateDataFlowNode,
  MarkdownCodeNode
};

// Define node types mapping for ReactFlow
export const nodeTypes = {
  default: DefaultNode,
  appName: AppNameNode,
  tagline: TaglineNode,
  coreProblem: CoreProblemNode,
  mission: MissionNode,
  valueProp: ValuePropositionNode,
  userPersona: UserPersonaNode,
  competitor: CompetitorNode,
  platform: PlatformNode,
  techStack: TechStackNode,
  uiStyle: UIStyleNode,
  feature: FeatureNode,
  architecture: ArchitectureNode,
  informationArchitecture: InformationArchitectureNode,
  userJourney: UserJourneyNode,
  stateDataFlow: StateDataFlowNode, 
  markdownCode: MarkdownCodeNode,
  system: DefaultNode, // Map system node type to DefaultNode
  'ux-flow': DefaultNode, // Also map ux-flow node type to DefaultNode
  wireframe: DefaultNode, // Also map wireframe node type to DefaultNode
  // Add more node types as they are implemented
};