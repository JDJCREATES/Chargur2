import React, { useState, useRef, useEffect } from 'react';
import { User, Edit3, RefreshCw } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';

const UserPersonaNode: React.FC<NodeProps> = ({ 
  id, 
  data, 
  selected,
  isConnectable 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: data?.name || '',
    role: data?.role || '',
    painPoint: data?.painPoint || '',
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    data?.onNodeUpdate?.(id, editData);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditData({
        name: data?.name || '',
        role: data?.role || '',
        painPoint: data?.painPoint || '',
      });
      setIsEditing(false);
    }
  };

  const generateRandomAvatar = () => {
    const emojis = [
      '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', 
      '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🎨', '👩‍🎨',
      '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🚀', '👩‍🚀',
      '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾', '👨‍🏭', '👩‍🏭',
      '🧑‍💼', '🧑‍💻', '🧑‍🎓', '🧑‍⚕️', '🧑‍🏫', '🧑‍🎨',
      '🧑‍🍳', '🧑‍🔧', '🧑‍🚀', '🧑‍⚖️', '🧑‍🌾', '🧑‍🏭'
    ];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    data?.onNodeUpdate?.(id, { emoji: randomEmoji });
  };

  const displayName = data?.name || "New Persona";
  const displayRole = data?.role || "Role/Descriptor";
  const displayPainPoint = data?.painPoint || "Pain point or goal...";

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
        relative w-full h-full bg-gradient-to-b from-blue-50 to-indigo-50 
        rounded-lg shadow-md border-2 transition-all duration-300
        ${selected ? 'border-blue-400 shadow-lg' : 'border-blue-200'}
      `}>
        {/* Avatar Head */}
        <div className="flex justify-center -mt-6 mb-2">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg" style={{ zIndex: 20 }}>
              {data?.avatarUrl ? (
                <img 
                  src={data.avatarUrl} 
                  alt={data?.name || 'Avatar'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{data?.emoji || '👤'}</span>
              )}
            </div>
            
            {/* Refresh Avatar Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateRandomAvatar();
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-blue-300 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors"
              title="Generate new avatar"
            >
              <RefreshCw className="w-2.5 h-2.5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-4 pb-4">
          {isEditing ? (
            <div className="space-y-3">
              <input
                ref={nameInputRef}
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-sm font-medium text-center bg-white border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Persona name"
              />
              
              <input
                type="text"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-xs text-center bg-blue-100 border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Role/Descriptor"
              />
              
              <textarea
                value={editData.painPoint}
                onChange={(e) => setEditData({ ...editData, painPoint: e.target.value })}
                onKeyDown={handleKeyPress}
                className="w-full text-xs bg-white border border-blue-200 rounded px-2 py-1 h-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pain point or goal..."
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 text-xs bg-blue-600 text-white rounded py-1 hover:bg-blue-700 transition-colors"
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
            <div className="text-center space-y-2">
              {/* Name */}
              <h3 className="font-medium text-sm text-blue-900 truncate">
                {displayName}
              </h3>
              
              {/* Role Tag */}
              <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {displayRole}
              </div>
              
              {/* Pain Point */}
              <p className="text-xs text-blue-700 leading-tight px-1 min-h-8">
                {displayPainPoint}
              </p>
              
              {/* Edit Button */}
              {data?.editable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors mx-auto"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete Button (when selected) */}
        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
             data?.onNodeDelete?.(id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

export default UserPersonaNode;