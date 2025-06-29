import React, { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeProps } from 'reactflow';
import { Layout, Edit3, Plus, Trash2, Copy, Check, X, Layers, Monitor, Smartphone, Tablet } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; 

// Define the layout block interface
export interface LayoutBlock {
  id: string;
  type: 'header' | 'sidebar' | 'content' | 'footer' | 'card' | 'modal' | 'navigation';
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  locked?: boolean;
}

// Define the layout template interface
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  blocks: LayoutBlock[];
  category: 'web' | 'mobile' | 'responsive';
  icon?: React.ComponentType<any>;
}

// Define the node data interface
export interface LofiLayoutNodeData {
  layoutId: string;
  templateName: string;
  layoutBlocks: LayoutBlock[];
  description?: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  editable: boolean;
  onNodeUpdate?: (id: string, updates: Partial<any>) => void;
  onNodeDelete?: (id: string) => void;
  onAddCard?: (layoutId: string, card: LayoutBlock) => void;
  onUpdateCard?: (layoutId: string, cardId: string, updates: Partial<LayoutBlock>) => void;
  onDeleteCard?: (layoutId: string, cardId: string) => void;
  onSelectTemplate?: (layoutId: string, templateId: string) => void;
}

// Predefined layout templates
const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    description: 'Standard dashboard with sidebar navigation',
    category: 'web',
    icon: Layout,
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'sidebar', type: 'sidebar', label: 'Sidebar', position: { x: 0, y: 10 }, size: { width: 20, height: 80 }, locked: true },
      { id: 'content', type: 'content', label: 'Content Area', position: { x: 20, y: 10 }, size: { width: 80, height: 80 }, locked: true },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'login',
    name: 'Login Screen',
    description: 'Centered login form with logo',
    category: 'responsive',
    blocks: [
      { id: 'header', type: 'header', label: 'Logo Area', position: { x: 0, y: 0 }, size: { width: 100, height: 20 }, locked: true },
      { id: 'content', type: 'content', label: 'Login Form', position: { x: 25, y: 30 }, size: { width: 50, height: 40 }, locked: true },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'product',
    name: 'Product Page',
    description: 'E-commerce product detail page',
    category: 'web',
    blocks: [
      { id: 'header', type: 'header', label: 'Header & Nav', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'product-image', type: 'card', label: 'Product Images', position: { x: 0, y: 15 }, size: { width: 40, height: 40 } },
      { id: 'product-info', type: 'card', label: 'Product Info', position: { x: 45, y: 15 }, size: { width: 55, height: 40 } },
      { id: 'related', type: 'card', label: 'Related Products', position: { x: 0, y: 60 }, size: { width: 100, height: 25 } },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'profile',
    name: 'Profile Page',
    description: 'User profile with tabs',
    category: 'responsive',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'profile-header', type: 'card', label: 'Profile Header', position: { x: 10, y: 15 }, size: { width: 80, height: 20 } },
      { id: 'tabs', type: 'navigation', label: 'Profile Tabs', position: { x: 10, y: 40 }, size: { width: 80, height: 5 } },
      { id: 'tab-content', type: 'content', label: 'Tab Content', position: { x: 10, y: 50 }, size: { width: 80, height: 35 }, locked: true },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'settings',
    name: 'Settings Screen',
    description: 'App settings with sidebar navigation',
    category: 'web',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'sidebar', type: 'sidebar', label: 'Settings Nav', position: { x: 0, y: 10 }, size: { width: 25, height: 80 }, locked: true },
      { id: 'content', type: 'content', label: 'Settings Content', position: { x: 25, y: 10 }, size: { width: 75, height: 80 }, locked: true },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'chat',
    name: 'Chat Interface',
    description: 'Messaging interface with conversation list',
    category: 'responsive',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'chat-list', type: 'sidebar', label: 'Conversations', position: { x: 0, y: 10 }, size: { width: 30, height: 80 }, locked: true },
      { id: 'chat-header', type: 'card', label: 'Chat Header', position: { x: 30, y: 10 }, size: { width: 70, height: 10 } },
      { id: 'messages', type: 'content', label: 'Messages', position: { x: 30, y: 20 }, size: { width: 70, height: 60 }, locked: true },
      { id: 'message-input', type: 'card', label: 'Message Input', position: { x: 30, y: 80 }, size: { width: 70, height: 10 } }
    ]
  },
  {
    id: 'feed',
    name: 'Social Feed',
    description: 'Social media feed with stories and posts',
    category: 'mobile',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'stories', type: 'card', label: 'Stories', position: { x: 0, y: 10 }, size: { width: 100, height: 15 } },
      { id: 'posts', type: 'content', label: 'Posts Feed', position: { x: 0, y: 25 }, size: { width: 100, height: 65 }, locked: true },
      { id: 'bottom-nav', type: 'navigation', label: 'Bottom Nav', position: { x: 0, y: 90 }, size: { width: 100, height: 10 } }
    ]
  },
  {
    id: 'form',
    name: 'Form Layout',
    description: 'Multi-step form with progress indicator',
    category: 'responsive',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'progress', type: 'navigation', label: 'Progress Bar', position: { x: 10, y: 15 }, size: { width: 80, height: 5 } },
      { id: 'form-content', type: 'content', label: 'Form Fields', position: { x: 10, y: 25 }, size: { width: 80, height: 55 }, locked: true },
      { id: 'buttons', type: 'card', label: 'Action Buttons', position: { x: 10, y: 80 }, size: { width: 80, height: 10 } },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Marketing landing page with sections',
    category: 'web',
    blocks: [
      { id: 'header', type: 'header', label: 'Header & Nav', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'hero', type: 'card', label: 'Hero Section', position: { x: 0, y: 10 }, size: { width: 100, height: 30 } },
      { id: 'features', type: 'card', label: 'Features', position: { x: 0, y: 40 }, size: { width: 100, height: 20 } },
      { id: 'testimonials', type: 'card', label: 'Testimonials', position: { x: 0, y: 60 }, size: { width: 100, height: 15 } },
      { id: 'cta', type: 'card', label: 'Call to Action', position: { x: 0, y: 75 }, size: { width: 100, height: 15 } },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard',
    category: 'web',
    blocks: [
      { id: 'header', type: 'header', label: 'Header', position: { x: 0, y: 0 }, size: { width: 100, height: 10 }, locked: true },
      { id: 'sidebar', type: 'sidebar', label: 'Filters', position: { x: 0, y: 10 }, size: { width: 20, height: 80 }, locked: true },
      { id: 'kpi-row', type: 'card', label: 'KPI Metrics', position: { x: 20, y: 10 }, size: { width: 80, height: 15 } },
      { id: 'chart1', type: 'card', label: 'Chart 1', position: { x: 20, y: 25 }, size: { width: 40, height: 30 } },
      { id: 'chart2', type: 'card', label: 'Chart 2', position: { x: 60, y: 25 }, size: { width: 40, height: 30 } },
      { id: 'table', type: 'card', label: 'Data Table', position: { x: 20, y: 55 }, size: { width: 80, height: 35 } },
      { id: 'footer', type: 'footer', label: 'Footer', position: { x: 0, y: 90 }, size: { width: 100, height: 10 }, locked: true }
    ]
  }
];

// Get color for layout block type
const getBlockColor = (type: string): string => {
  switch (type) {
    case 'header':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'sidebar':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'content':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'footer':
      return 'bg-gray-100 border-gray-300 text-gray-800';
    case 'card':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'modal':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'navigation':
      return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

// Get icon for view mode
const getViewModeIcon = (mode: string) => {
  switch (mode) {
    case 'desktop':
      return <Monitor className="w-4 h-4" />;
    case 'tablet':
      return <Tablet className="w-4 h-4" />;
    case 'mobile':
      return <Smartphone className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

// Get width multiplier for view mode
const getViewModeWidth = (mode: string): number => {
  switch (mode) {
    case 'desktop':
      return 1;
    case 'tablet':
      return 0.7;
    case 'mobile':
      return 0.4;
    default:
      return 1;
  }
};

// Component implementation
const LofiLayoutNodeComponent: React.FC<NodeProps<LofiLayoutNodeData>> = ({ 
  id, 
  data, 
  selected,
  isConnectable
}) => {
  console.log('LofiLayoutNode rendering with data:', data);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardLabel, setEditingCardLabel] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize with default data if not provided
  const layoutId = data.layoutId || id;
  const templateName = data.templateName || 'Dashboard Layout';
  const layoutBlocks = data.layoutBlocks || LAYOUT_TEMPLATES[0].blocks;
  const viewMode = data.viewMode || 'desktop';
  const editable = data.editable !== undefined ? data.editable : true;
  
  // Find the current template
  const currentTemplate = LAYOUT_TEMPLATES.find(t => t.name === templateName) || LAYOUT_TEMPLATES[0];

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (template && data?.onNodeUpdate) {
      console.log('Updating template to:', template.name);
      data.onNodeUpdate(id, {
        templateName: template.name,
        layoutBlocks: template.blocks,
      });
      setSelectedTemplateId('');
    }
  };

  // Handle adding a new card
  const handleAddCard = () => {
    const newCard: LayoutBlock = {
      id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'card',
      label: 'New Card',
      position: { x: 30, y: 40 },
      size: { width: 40, height: 20 }
    };
    
    if (data?.onNodeUpdate) {
      console.log('Adding new card:', newCard);
      data.onNodeUpdate(id, {
        layoutBlocks: [...layoutBlocks, newCard]
      });
    }
  };

  // Handle updating a card
  const handleUpdateCard = (cardId: string, updates: Partial<LayoutBlock>) => {
    if (data?.onNodeUpdate) {
      console.log('Updating card:', cardId, updates);
      const updatedBlocks = layoutBlocks.map(block => 
        block.id === cardId ? { ...block, ...updates } : block
      );
      
      data.onNodeUpdate(id, {
        layoutBlocks: updatedBlocks
      });
    }
  };

  // Handle deleting a card
  const handleDeleteCard = (cardId: string) => {
    if (data?.onNodeUpdate) {
      console.log('Deleting card:', cardId);
      const updatedBlocks = layoutBlocks.filter(block => block.id !== cardId);
      
      data.onNodeUpdate(id, {
        layoutBlocks: updatedBlocks
      });
    }
  };

  // Handle card drag start
  const handleCardDragStart = (e: React.MouseEvent, cardId: string) => {
    if (!isEditing || !canvasRef.current) return;
    
    const card = layoutBlocks.find(block => block.id === cardId);
    if (!card || card.locked) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDraggedCardId(cardId);
    
    // Calculate offset from mouse position to card position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const cardX = (card.position.x / 100) * canvasRect.width;
    const cardY = (card.position.y / 100) * canvasRect.height;
    
    setDragOffset({
      x: e.clientX - canvasRect.left - cardX,
      y: e.clientY - canvasRect.top - cardY
    });
  };

  // Handle card drag
  const handleCardDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedCardId || !canvasRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position in percentage
    const newX = ((e.clientX - canvasRect.left - dragOffset.x) / canvasRect.width) * 100;
    const newY = ((e.clientY - canvasRect.top - dragOffset.y) / canvasRect.height) * 100;
    
    // Clamp values to keep within canvas
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));
    
    handleUpdateCard(draggedCardId, {
      position: { x: clampedX, y: clampedY }
    });
  };

  // Handle card drag end
  const handleCardDragEnd = () => {
    setIsDragging(false);
    setDraggedCardId(null);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    if (data?.onNodeUpdate) {
      console.log('Changing view mode to:', mode);
      data.onNodeUpdate(id, {
        viewMode: mode
      });
    }
  };

  // Handle card label edit
  const handleCardLabelEdit = (cardId: string) => {
    const card = layoutBlocks.find(block => block.id === cardId);
    if (card) {
      setEditingCardId(cardId);
      setEditingCardLabel(card.label);
    }
  };

  // Handle card label save
  const handleCardLabelSave = () => {
    if (editingCardId) {
      console.log('Saving card label:', editingCardId, editingCardLabel);
      handleUpdateCard(editingCardId, {
        label: editingCardLabel
      });
      setEditingCardId(null);
      setEditingCardLabel('');
    }
  };

  // Effect to add window mouse move and up listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current || !draggedCardId) return;
        
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // Calculate new position in percentage
        const newX = ((e.clientX - canvasRect.left - dragOffset.x) / canvasRect.width) * 100;
        const newY = ((e.clientY - canvasRect.top - dragOffset.y) / canvasRect.height) * 100;
        
        // Clamp values to keep within canvas
        const clampedX = Math.max(0, Math.min(100, newX));
        const clampedY = Math.max(0, Math.min(100, newY));
        
        handleUpdateCard(draggedCardId, {
          position: { x: clampedX, y: clampedY }
        });
      };
      
      const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedCardId(null);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      console.log('Added window event listeners for dragging');
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        console.log('Removed window event listeners for dragging');
      };
    }
  }, [isDragging, draggedCardId, dragOffset]);

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />

      <div className={`
        relative w-full h-full bg-white 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
      `}>
        {/* Header */}
        <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-sm text-blue-800">{templateName}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="flex border border-blue-200 rounded-md overflow-hidden">
              <button
                onClick={() => handleViewModeChange('desktop')}
                className={`p-1 ${viewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'}`}
                title="Desktop View"
              >
                <Monitor className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleViewModeChange('tablet')}
                className={`p-1 ${viewMode === 'tablet' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'}`}
                title="Tablet View"
              >
                <Tablet className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleViewModeChange('mobile')}
                className={`p-1 ${viewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3 h-3" />
              </button>
            </div>
            
            {/* Edit Button */}
            {editable && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1 rounded ${isEditing ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
                title={isEditing ? 'Save Layout' : 'Edit Layout'}
              >
                {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Template Selection (when editing) */}
        {isEditing && (
          <div className="p-3 border-b border-blue-100 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-700">Template</span>
              <div className="relative">
                <button
                  onClick={() => setSelectedTemplateId(selectedTemplateId ? '' : 'show')}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-blue-200 rounded hover:bg-blue-50"
                >
                  <span>Change Template</span>
                </button>
                
                {selectedTemplateId === 'show' && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-blue-200 rounded-md shadow-lg z-10 w-48">
                    <div className="p-1 max-h-48 overflow-y-auto">
                      {LAYOUT_TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 rounded"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-600">{currentTemplate.description}</span>
              <button
                onClick={handleAddCard}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Card
              </button>
            </div>
          </div>
        )}

        {/* Layout Canvas */}
        <div 
          ref={canvasRef}
          className="p-3 h-[calc(100%-60px)] overflow-hidden"
          onMouseMove={handleCardDrag}
          onMouseUp={handleCardDragEnd}
        >
          {/* Layout Visualization */}
          <div 
            className="relative bg-gray-50 border border-gray-200 rounded w-full h-full overflow-hidden"
            style={{ 
              width: `${getViewModeWidth(viewMode) * 100}%`, 
              margin: '0 auto'
            }}
          >
            {layoutBlocks.map(block => {
              const isEditable = isEditing && !block.locked;
              const isBeingEdited = editingCardId === block.id;
              
              return (
                <div
                  key={block.id}
                  className={`absolute border-2 rounded flex items-center justify-center transition-all ${getBlockColor(block.type)} ${isEditable ? 'cursor-move' : ''}`}
                  style={{
                    left: `${block.position.x}%`,
                    top: `${block.position.y}%`,
                    width: `${block.size.width}%`,
                    height: `${block.size.height}%`,
                    zIndex: isBeingEdited ? 10 : 1
                  }}
                  onMouseDown={(e) => isEditable && handleCardDragStart(e, block.id)}
                >
                  {isBeingEdited ? (
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <input
                        type="text"
                        value={editingCardLabel}
                        onChange={(e) => setEditingCardLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCardLabelSave()}
                        className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardLabelSave();
                        }}
                        className="ml-1 p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 relative">
                      <span className="text-xs font-medium truncate max-w-full px-1">{block.label}</span>
                      
                      {/* Edit controls for non-locked blocks when in edit mode */} 
                      {isEditing && !block.locked && (
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardLabelEdit(block.id);
                            }}
                            className="p-0.5 bg-white bg-opacity-80 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <Edit3 className="w-2 h-2" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(block.id);
                            }}
                            className="p-0.5 bg-white bg-opacity-80 text-red-600 rounded hover:bg-red-100"
                          >
                            <Trash2 className="w-2 h-2" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
const LofiLayoutNode = memo(LofiLayoutNodeComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.data.layoutId === nextProps.data.layoutId &&
    prevProps.data.templateName === nextProps.data.templateName &&
    prevProps.data.viewMode === nextProps.data.viewMode &&
    JSON.stringify(prevProps.data.layoutBlocks) === JSON.stringify(nextProps.data.layoutBlocks) &&
    prevProps.isConnectable === nextProps.isConnectable
  );
});

export default LofiLayoutNode;