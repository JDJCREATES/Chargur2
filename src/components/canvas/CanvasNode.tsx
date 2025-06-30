export interface Node<T = any> {
  id: string;
  type: 'concept' | 'feature' | 'ux-flow' | 'wireframe' | 'system' | 'agent-output' | 
        'appName' | 'tagline' | 'coreProblem' | 'mission' | 'userPersona' | 'valueProp' | 'competitor' |
        'techStack' | 'uiStyle' | 'platform' | 'architecture';
  title: string;
  content: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color: string;
  connections: string[];
  metadata?: T;
  collapsed?: boolean;
  resizable?: boolean;
  // Feature node specific properties
  subFeatures?: string[];
  showBreakdown?: boolean;
  // Add properties that match the custom nodes from SpatialCanvas
  value?: string;
  editable?: boolean;
  nameHistory?: string[];
  keywords?: string[];
  bulletPoints?: string[];
  name?: string;
  role?: string;
  painPoint?: string;
  emoji?: string;
  notes?: string;
  link?: string;
  missionStatement?: string;
  // Enhanced competitor node properties
  domain?: string;
  tagline?: string;
  features?: string[];
  pricingTiers?: string[];
  marketPositioning?: string;
  strengths?: string[];
  weaknesses?: string[];
  // Add properties for the new node types
  techStack?: string[];
  uiStyle?: string;
  platform?: string;
}

export interface CanvasNodeProps {
  node: Node<any>;
  isSelected: boolean;
  isConnecting?: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
}
