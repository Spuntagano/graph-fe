import React, { useState } from 'react';
import { Layout } from '../types';

interface LayoutManagerProps {
  layouts: Layout[];
  currentLayoutId: string;
  onLayoutSelect: (layoutId: string) => void;
  onLayoutCreate: (name: string, description?: string) => void;
  onLayoutUpdate: (layoutId: string, name: string, description?: string) => void;
  onLayoutDelete: (layoutId: string) => void;
  onLayoutSave?: (layout: Layout) => void;
  onReplaceWithDefaults: () => void;
}

const LayoutManager: React.FC<LayoutManagerProps> = ({
  layouts,
  currentLayoutId,
  onLayoutSelect,
  onLayoutCreate,
  onLayoutUpdate,
  onLayoutDelete,
  onLayoutSave,
  onReplaceWithDefaults
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const currentLayout = layouts.find(l => l.id === currentLayoutId);

  const handleCreateLayout = () => {
    if (formData.name.trim()) {
      onLayoutCreate(formData.name, formData.description || undefined);
      setFormData({ name: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditLayout = () => {
    if (editingLayout && formData.name.trim()) {
      onLayoutUpdate(editingLayout.id, formData.name, formData.description || undefined);
      setFormData({ name: '', description: '' });
      setShowEditModal(false);
      setEditingLayout(null);
    }
  };

  const handleDeleteLayout = () => {
    if (currentLayout && layouts.length > 1) {
      if (window.confirm(`Are you sure you want to delete "${currentLayout.name}"?`)) {
        onLayoutDelete(currentLayout.id);
      }
    }
  };

  const handleSaveLayout = () => {
    if (currentLayout && onLayoutSave) {
      console.log(currentLayout);
      onLayoutSave(currentLayout);
    }
  };

  const openEditModal = (layout: Layout) => {
    setEditingLayout(layout);
    setFormData({ name: layout.name, description: layout.description || '' });
    setShowEditModal(true);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">Layouts</h3>
          
          <div className="relative">
            <select
              value={currentLayoutId}
              onChange={(e) => onLayoutSelect(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>

          {currentLayout && (
            <div className="text-sm text-gray-600">
              {currentLayout.elements.length} elements • 
              {currentLayout.updatedAt && `Updated ${currentLayout.updatedAt.toLocaleDateString()}`}
            </div>
          )}
        </div>


        <div className="flex items-center space-x-2">
          <button
              onClick={() => {
                  if (window.confirm('This will replace all current elements with default examples. Are you sure?')) {
                      onReplaceWithDefaults();
                  }
               }}
               className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-200 text-sm"
          >
              Populate
         </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            New Layout
          </button>
          
          {currentLayout && (
            <>
              <button
                onClick={handleSaveLayout}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm"
              >
                Save to DB
              </button>
              
              <button
                onClick={() => openEditModal(currentLayout)}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
              >
                Edit
              </button>
              
              <button
                onClick={handleDeleteLayout}
                disabled={layouts.length <= 1}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Layout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter layout name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLayout()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter layout description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLayout}
                  disabled={!formData.name.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingLayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Layout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter layout name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleEditLayout()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter layout description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditLayout}
                  disabled={!formData.name.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLayout(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutManager; 