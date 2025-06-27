    export interface CanvasNodeData {
  id: string;
  type: 'concept' | 'feature' | 'ux-flow' | 'wireframe' | 'system' | 'agent-output' | 
        'appName' | 'tagline' | 'coreProblem' | 'mission' | 'userPersona' | 'valueProp' | 'competitor';
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  connections: string[];
  metadata?: any;
  collapsed?: boolean;
  resizable?: boolean;
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
}

interface CanvasNodeProps {
  node: CanvasNodeData;
  isSelected: boolean;
  isConnecting?: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<CanvasNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
}