import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Link,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  GiLightBulb,
  GiEnergise,
  GiPerson,
  GiWindow,
  GiDatabase,
  GiConversation,
  GiScrollQuill,
  GiCrown,
  GiQuill,
  GiBullseye,
  GiDiamonds,
  GiCrossedSwords
} from 'react-icons/gi';


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