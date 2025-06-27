import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Edit3, FileText, Trash2, DollarSign, Target, ThumbsUp, ThumbsDown, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitorNodeData {
  id: string;
  name: string;
  notes: string;
  link?: string;
  domain?: string;
  tagline?: string;
  features?: string[];
  pricingTiers?: string[];
  marketPositioning?: string;
  strengths?: string[];
  weaknesses?: string[];
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
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editData, setEditData] = useState({
    name: node.name,
    notes: node.notes,
    link: node.link || '',
    domain: node.domain || '',
    tagline: node.tagline || '',
    features: node.features || [],
    pricingTiers: node.pricingTiers || [],
    marketPositioning: node.marketPositioning || '',
    strengths: node.strengths || [],
    weaknesses: node.weaknesses || [],
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'features' | 'positioning' | 'swot'>('basic');
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
      domain: editData.domain.trim() || undefined,
      tagline: editData.tagline.trim() || undefined,
      features: editData.features.filter(f => f.trim()),
      pricingTiers: editData.pricingTiers.filter(p => p.trim()),
      marketPositioning: editData.marketPositioning.trim() || undefined,
      strengths: editData.strengths.filter(s => s.trim()),
      weaknesses: editData.weaknesses.filter(w => w.trim()),
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
        domain: node.domain || '',
        tagline: node.tagline || '',
        features: node.features || [],
        pricingTiers: node.pricingTiers || [],
        marketPositioning: node.marketPositioning || '',
        strengths: node.strengths || [],
        weaknesses: node.weaknesses || [],
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
  const hasDomain = node.domain && node.domain.trim().length > 0;
  const hasTagline = node.tagline && node.tagline.trim().length > 0;
  const hasFeatures = node.features && node.features.length > 0;
  const hasPricingTiers = node.pricingTiers && node.pricingTiers.length > 0;
  const hasMarketPositioning = node.marketPositioning && node.marketPositioning.trim().length > 0;
  const hasStrengths = node.strengths && node.strengths.length > 0;
  const hasWeaknesses = node.weaknesses && node.weaknesses.length > 0;

  // Helper function to add items to arrays
  const addArrayItem = (field: keyof typeof editData, value: string) => {
    if (Array.isArray(editData[field])) {
      setEditData({
        ...editData,
        [field]: [...(editData[field] as string[]), value]
      });
    }
  };

  // Helper function to remove items from arrays
  const removeArrayItem = (field: keyof typeof editData, index: number) => {
    if (Array.isArray(editData[field])) {
      const newArray = [...(editData[field] as string[])];
      newArray.splice(index, 1);
      setEditData({
        ...editData,
        [field]: newArray
      });
    }
  };

  // Helper function to update items in arrays
  const updateArrayItem = (field: keyof typeof editData, index: number, value: string) => {
    if (Array.isArray(editData[field])) {
      const newArray = [...(editData[field] as string[])];
      newArray[index] = value;
      setEditData({
        ...editData,
        [field]: newArray
      });
    }
  };

  return (
    <div className={`
      relative w-full h-full bg-gradient-to-br from-red-50 to-pink-50 
      rounded-lg shadow-md border-2 transition-all duration-300
      ${isSelected ? 'border-red-400 shadow-lg' : 'border-red-200'}
    `}>
        {/* Main Content */}
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3 max-h-[calc(100%-40px)] overflow-y-auto">
              {/* Tabs for different sections */}
              <div className="flex border-b border-red-200 mb-2">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-2 py-1 text-xs rounded-t-md ${
                    activeTab === 'basic' ? 'bg-red-100 text-red-800 font-medium' : 'text-red-600'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-2 py-1 text-xs rounded-t-md ${
                    activeTab === 'features' ? 'bg-red-100 text-red-800 font-medium' : 'text-red-600'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('positioning')}
                  className={`px-2 py-1 text-xs rounded-t-md ${
                    activeTab === 'positioning' ? 'bg-red-100 text-red-800 font-medium' : 'text-red-600'
                  }`}
                >
                  Positioning
                </button>
                <button
                  onClick={() => setActiveTab('swot')}
                  className={`px-2 py-1 text-xs rounded-t-md ${
                    activeTab === 'swot' ? 'bg-red-100 text-red-800 font-medium' : 'text-red-600'
                  }`}
                >
                  SWOT
                </button>
              </div>
              
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-2">
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
                    value={editData.domain}
                    onChange={(e) => setEditData({ ...editData, domain: e.target.value })}
                    onKeyDown={handleKeyPress}
                    className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Domain (e.g., example.com)"
                  />
                  
                  <input
                    type="text"
                    value={editData.link}
                    onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                    onKeyDown={handleKeyPress}
                    className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Full URL (e.g., https://example.com)"
                  />
                  
                  <input
                    type="text"
                    value={editData.tagline}
                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                    onKeyDown={handleKeyPress}
                    className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tagline or elevator pitch"
                  />
                  
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    onKeyDown={handleKeyPress}
                    className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 h-16 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="General notes about this competitor..."
                  />
                </div>
              )}
              
              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-red-700 mb-1">Unique Core Features:</div>
                  {editData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateArrayItem('features', index, e.target.value)}
                        className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Feature description"
                      />
                      <button
                        onClick={() => removeArrayItem('features', index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add new feature..."
                      className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('features', e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          addArrayItem('features', input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Positioning Tab */}
              {activeTab === 'positioning' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-red-700 mb-1">Pricing Tiers:</div>
                  {editData.pricingTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tier}
                        onChange={(e) => updateArrayItem('pricingTiers', index, e.target.value)}
                        className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Pricing tier (e.g., Free, Pro $9.99/mo)"
                      />
                      <button
                        onClick={() => removeArrayItem('pricingTiers', index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add pricing tier..."
                      className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('pricingTiers', e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          addArrayItem('pricingTiers', input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-xs font-medium text-red-700 mt-3 mb-1">Market Positioning:</div>
                  <select
                    value={editData.marketPositioning}
                    onChange={(e) => setEditData({ ...editData, marketPositioning: e.target.value })}
                    className="w-full text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select positioning...</option>
                    <option value="budget">Budget</option>
                    <option value="mid-market">Mid-Market</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              )}
              
              {/* SWOT Tab */}
              {activeTab === 'swot' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-red-700 mb-1">Strengths:</div>
                  {editData.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={strength}
                        onChange={(e) => updateArrayItem('strengths', index, e.target.value)}
                        className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="What they do well"
                      />
                      <button
                        onClick={() => removeArrayItem('strengths', index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add strength..."
                      className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('strengths', e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          addArrayItem('strengths', input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-xs font-medium text-red-700 mt-3 mb-1">Weaknesses:</div>
                  {editData.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={weakness}
                        onChange={(e) => updateArrayItem('weaknesses', index, e.target.value)}
                        className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Where they struggle"
                      />
                      <button
                        onClick={() => removeArrayItem('weaknesses', index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add weakness..."
                      className="flex-1 text-xs bg-white border border-red-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addArrayItem('weaknesses', e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          addArrayItem('weaknesses', input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2 mt-2 border-t border-red-200">
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
            <div className="space-y-2 max-h-[calc(100%-20px)] overflow-y-auto">
              {/* Basic Info Section */}
              <div>
                <h3 className="font-medium text-sm text-red-900 truncate">
                  {displayName}
                </h3>
                
                {(hasDomain || hasTagline) && (
                  <div className="mt-1 space-y-1">
                    {hasDomain && (
                      <div className="text-xs text-red-700 flex items-center gap-1">
                        <span className="font-medium">Domain:</span>
                        <span className="font-mono">{node.domain}</span>
                      </div>
                    )}
                    {hasTagline && (
                      <div className="text-xs text-red-700 italic">
                        "{node.tagline}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Features Section */}
              {hasFeatures && (
                <div className="mt-2 pt-2 border-t border-red-100">
                  <div className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Core Features:</span>
                  </div>
                  <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                    {node.features?.slice(0, 3).map((feature, index) => (
                      <li key={index} className="truncate">{feature}</li>
                    ))}
                    {(node.features?.length || 0) > 3 && (
                      <li className="text-red-400">+{(node.features?.length || 0) - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Positioning Section */}
              {(hasPricingTiers || hasMarketPositioning) && (
                <div className="mt-2 pt-2 border-t border-red-100">
                  <div className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Positioning:</span>
                  </div>
                  
                  {hasMarketPositioning && (
                    <div className="text-xs text-red-600 mb-1">
                      <span className="font-medium">Market:</span> {node.marketPositioning}
                    </div>
                  )}
                  
                  {hasPricingTiers && (
                    <div className="flex flex-wrap gap-1">
                      {node.pricingTiers?.slice(0, 2).map((tier, index) => (
                        <span key={index} className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />
                          {tier}
                        </span>
                      ))}
                      {(node.pricingTiers?.length || 0) > 2 && (
                        <span className="text-xs text-red-400">+{(node.pricingTiers?.length || 0) - 2} more</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* SWOT Section */}
              {(hasStrengths || hasWeaknesses) && (
                <div className="mt-2 pt-2 border-t border-red-100">
                  <div className="text-xs font-medium text-red-700 mb-1">SWOT-lite:</div>
                  
                  {hasStrengths && (
                    <div className="mb-1">
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <ThumbsUp className="w-2.5 h-2.5" />
                        <span className="font-medium">Strengths:</span>
                      </div>
                      <div className="text-xs text-green-600 ml-4">
                        {node.strengths?.[0] || ''}
                        {(node.strengths?.length || 0) > 1 && (
                          <span className="text-green-400"> +{(node.strengths?.length || 0) - 1} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {hasWeaknesses && (
                    <div>
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <ThumbsDown className="w-2.5 h-2.5" />
                        <span className="font-medium">Weaknesses:</span>
                      </div>
                      <div className="text-xs text-red-600 ml-4">
                        {node.weaknesses?.[0] || ''}
                        {(node.weaknesses?.length || 0) > 1 && (
                          <span className="text-red-400"> +{(node.weaknesses?.length || 0) - 1} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-100">
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
  );
};