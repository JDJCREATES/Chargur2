import React from 'react';
import { Type, Plus } from 'lucide-react';
import { CopywritingItem } from './types';

interface UXCopywritingSectionProps {
  copywriting: CopywritingItem[];
  onAddCopywritingItem: () => void;
  onUpdateCopywritingItem: (id: string, updates: Partial<CopywritingItem>) => void;
}

export const UXCopywritingSection: React.FC<UXCopywritingSectionProps> = ({
  copywriting,
  onAddCopywritingItem,
  onUpdateCopywritingItem
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Customize all text elements in your app</p>
        <button
          onClick={onAddCopywritingItem}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="w-3 h-3" />
          Add Text
        </button>
      </div>
      
      <div className="space-y-2">
        {copywriting.map((item: CopywritingItem) => (
          <div key={item.id} className="p-3 bg-teal-50 rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block font-medium text-teal-700 mb-1">Type</label>
                <select 
                  value={item.type}
                  onChange={(e) => onUpdateCopywritingItem(item.id, { 
                    type: e.target.value as 'button' | 'label' | 'placeholder' | 'error' | 'heading' 
                  })}
                  className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500">
                  <option value="button">Button</option>
                  <option value="label">Label</option>
                  <option value="placeholder">Placeholder</option>
                  <option value="error">Error</option>
                  <option value="heading">Heading</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-teal-700 mb-1">Context</label>
                <input
                  type="text"
                  value={item.context}
                  className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block font-medium text-teal-700 mb-1">Text</label>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => onUpdateCopywritingItem(item.id, { text: e.target.value })}
                  className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-teal-700 mb-1">Tone</label>
                <select 
                  value={item.tone}
                  onChange={(e) => onUpdateCopywritingItem(item.id, { 
                    tone: e.target.value as 'professional' | 'playful' | 'casual' 
                  })}
                  className="w-full px-2 py-1 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500">
                  <option value="professional">Professional</option>
                  <option value="playful">Playful</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};