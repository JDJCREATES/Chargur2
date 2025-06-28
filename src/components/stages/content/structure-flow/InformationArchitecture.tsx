import React from 'react';
import { Layers, Plus, Trash2, Database } from 'lucide-react';
import { Screen, DataModel } from './types';

interface InformationArchitectureProps {
  screens: Screen[];
  dataModels: DataModel[];
  onAddScreen: () => void;
  onRemoveScreen: (id: string) => void;
  onUpdateScreen: (id: string, updates: Partial<Screen>) => void;
  onAddDataModel: () => void;
}

export const InformationArchitecture: React.FC<InformationArchitectureProps> = ({
  screens,
  dataModels,
  onAddScreen,
  onRemoveScreen,
  onUpdateScreen,
  onAddDataModel
}) => {
  return (
    <div className="space-y-4">
      {/* Core Screens */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-800">Core Screens</h4>
          <button
            onClick={onAddScreen}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Screen
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {screens.map((s: Screen) => (
            <div key={s.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <input
                type="text"
                value={s.name}
                onChange={(e) => onUpdateScreen(s.id, { name: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={s.type}
                onChange={(e) => onUpdateScreen(s.id, { type: e.target.value as Screen['type'] })}
                className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="core">Core</option>
                <option value="secondary">Secondary</option>
                <option value="modal">Modal</option>
              </select>
              <button
                onClick={() => onRemoveScreen(s.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Models */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-800">Data Models</h4>
          <button
            onClick={onAddDataModel}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-3 h-3" />
            Add Model
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {dataModels.map((model: DataModel) => (
            <div key={model.id} className="p-2 bg-green-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-3 h-3 text-green-600" />
                <span className="font-medium text-sm text-green-800">{model.name}</span>
              </div>
              <div className="text-xs text-green-600 ml-5">
                {model.fields.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};