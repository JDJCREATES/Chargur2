import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Edit3, FileText, Trash2 } from 'lucide-react';

interface CompetitorNodeData {
  id: string;
  name: string;
  notes: string;
  link?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  editable: boolean;
}

interface CompetitorNodeProps {
  node: CompetitorNodeData;
  isSelected: boolean;
  onUpdate: (nodeId: string, updates: Partial<CompetitorNodeData>) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  scale: number;
}

export const CompetitorNode: React.FC<CompetitorNodeProps> = ({
  node,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editData, setEditData] = useState({
    name: node.name,
    notes: node.notes,
    link: node.link || '',
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate(node.id, {
      name: editData.name.trim(),
      notes: editData.notes.trim(),
      link: editData.link.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditData({
        name: node.name,
        notes: node.notes,
        link: node.link || '',
      });
      setIsEditing(false);
    }
  };

  const openLink = () => {
    if (node.link) {
      window.open(node.link.startsWith('http') ? node.link : `https://${node.link}`, '_blank');
    }
  };

  const displayName = node.name || "Competitor Name";
  const hasNotes = node.notes && node.notes.trim().length > 0;

  return (
    <motion.div
      className={`
        absolute cursor-pointer select-none transition-all duration-300
        ${isSelected ? 'z-50' : 'z-10'}
      `}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: node.size.width,
        minHeight: node.size.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      whileHover={{ scale: 1.02 }}
      animate={{
        scale: isSelected ? 1.05 : 1,
      }}
    >
      <div className={`
        relative w-full h-full bg-gradient-to-br from-red-50 to-pink-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${isSelected ? 'border-red-400 shadow-lg' : 'border-red-200'}
      `}>
        {/* Main Content */}
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3">
              <input
                ref={nameInputRef}
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-sm font-medium bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Competitor name"
              />
              
              <input
                type="text"
                value={editData.link}
                onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Website URL (optional)"
              />
              
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 h-16 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Notes about this competitor..."
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 text-xs bg-red-600 text-white rounded py-1 hover:bg-red-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 text-xs bg-gray-300 text-gray-700 rounded py-1 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Competitor Name */}
              <h3 className="font-medium text-sm text-red-900 truncate">
                {displayName}
              </h3>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {node.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLink();
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                    title="Visit website"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </button>
                )}
                
                {hasNotes && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotes(!showNotes);
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Notes
                  </button>
                )}
                
                {node.editable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes Popup */}
        {showNotes && hasNotes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-3 min-w-48 max-w-64 z-60 border border-red-200"
          >
            <h4 className="font-medium text-red-800 mb-2 text-sm">Notes</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {node.notes}
            </p>
            <button
              onClick={() => setShowNotes(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Delete Button (when selected) */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
};