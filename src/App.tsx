import React, { useState, useEffect } from 'react';
import { Layout as GridLayoutType } from "react-grid-layout";
import Sidebar from './components/Sidebar';
import Grid from './components/Grid';
import LayoutManager from './components/LayoutManager';
import { Element, Layout } from './types';

const App: React.FC = () => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('');
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'chart' | 'table' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentLayout = layouts.find(l => l.id === currentLayoutId);

  const createDefaultLayout = () => {
    const defaultLayout: Layout = {
      id: 'default',
      name: 'Default Layout',
      description: 'Default layout',
      layout: [],
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLayouts([defaultLayout]);
    setCurrentLayoutId('default');
  };

  const loadLayouts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/layouts');

      if (!response.ok) {
        createDefaultLayout();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        const loadedLayouts = result.data || [];

        const formattedLayouts = loadedLayouts.map((layout: any) => ({
          id: layout.id,
          name: layout.name,
          description: layout.description,
          layout: layout.layout || [],
          elements: layout.elements || [],
          createdAt: new Date(layout.createdAt),
          updatedAt: new Date(layout.updatedAt)
        }));

        setLayouts(formattedLayouts);

        if (formattedLayouts.length === 0) {
          createDefaultLayout();
          return;
        }

        setCurrentLayoutId(formattedLayouts[0].id);
      }
    } catch (error) {
      createDefaultLayout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  const handleAddElement = (element: Element) => {
    if (!currentLayout) return;

    const newLayoutItem = {
      i: element.id,
      x: 0,
      y: 0,
      w: 4,
      h: 4
    };
    
    const updatedLayout = {
      ...currentLayout,
      layout: [...currentLayout.layout, newLayoutItem],
      elements: [...currentLayout.elements, element],
      updatedAt: new Date()
    };

    setSelectedType(null);
    setLayouts(prev => prev.map(l => l.id === currentLayoutId ? updatedLayout : l));
  };

  const handleLayoutSelect = (layoutId: string) => {
    setCurrentLayoutId(layoutId);
  };

  const handleLayoutCreate = async (name: string, description?: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          layout: []
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const savedLayout = result.data;
        
        const newLayout: Layout = {
          id: savedLayout.id,
          name: savedLayout.name,
          description: savedLayout.description,
          layout: savedLayout.layout || [],
          elements: savedLayout.elements || [],
        };

        setLayouts(prev => [...prev, newLayout]);
        setCurrentLayoutId(newLayout.id);
      } else {
        const error = await response.json();
        console.error('Error creating layout:', error);
      }
    } catch (error) {
      console.error('Error creating layout:', error);
    }
  };

  const handleLayoutUpdate = async (layoutId: string, name: string, description?: string) => {
    try {
      const layoutToUpdate = layouts.find(l => l.id === layoutId);
      if (!layoutToUpdate) return;

      const response = await fetch(`http://localhost:3001/api/layouts/${layoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          layout: layoutToUpdate.layout,
          elements: layoutToUpdate.elements
        }),
      });

      if (response.ok) {
        setLayouts(prev => prev.map(l => 
          l.id === layoutId 
            ? { ...l, name, description, updatedAt: new Date() }
            : l
        ));
      } else {
        const error = await response.json();
        console.error('Error updating layout:', error);
      }
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  };

  const handleLayoutDelete = async (layoutId: string) => {
    if (layouts.length <= 1) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/layouts/${layoutId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Delete from local state only after successful database deletion
        setLayouts(prev => prev.filter(l => l.id !== layoutId));
        
        if (currentLayoutId === layoutId) {
          const remainingLayouts = layouts.filter(l => l.id !== layoutId);
          setCurrentLayoutId(remainingLayouts[0]?.id || 'default');
        }
      } else {
        const error = await response.json();
        console.error('Error deleting layout:', error);
      }
    } catch (error) {
      console.error('Error deleting layout:', error);
    }
  };

  const handleLayoutChange = (newLayout: GridLayoutType[]) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      layout: newLayout,
      updatedAt: new Date()
    };

    setLayouts(prev => prev.map(l => l.id === currentLayoutId ? updatedLayout : l));
  };

  const handleElementUpdate = (elementId: string, updates: Partial<Element>) => {
    if (!currentLayout) return;

    const updatedElements = currentLayout.elements.map(element =>
      element.id === elementId
        ? { ...element, ...updates }
        : element
    );

    const updatedLayout = {
      ...currentLayout,
      elements: updatedElements,
      updatedAt: new Date()
    };

    setLayouts(prev => prev.map(l => l.id === currentLayoutId ? updatedLayout : l));
    setEditingElement(null);
    setSelectedType(null);
  };

  const handleElementDelete = (elementId: string) => {
    if (!currentLayout) return;

    const updatedElements = currentLayout.elements.filter(element => element.id !== elementId);
    const updatedLayout = {
      ...currentLayout,
      layout: currentLayout.layout.filter(item => item.i !== elementId),
      elements: updatedElements,
      updatedAt: new Date()
    };

    setLayouts(prev => prev.map(l => l.id === currentLayoutId ? updatedLayout : l));
    setEditingElement(null);
    setSelectedType(null);
  };

  const handleReplaceWithDefaults = () => {
    if (!currentLayout) return;

    const defaultElements: Element[] = [
      {
        id: 'text-1',
        type: 'text',
        label: 'Welcome to your dashboard! This is a sample text element that you can edit by clicking on it.',
        properties: {
          color: '#3B82F6',
          size: 16,
          position: { x: 0, y: 0 }
        }
      },
      {
        id: 'image-1',
        type: 'image',
        label: '',
        properties: {
          url: 'https://picsum.photos/400/300?random=1',
          color: '#10B981',
          size: 100,
          position: { x: 4, y: 0 }
        }
      },
      {
        id: 'chart-1',
        type: 'chart',
        label: '',
        properties: {
          chartType: 'bar',
          chartData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
              {
                label: 'Sales',
                data: [12, 19, 3, 5, 2],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              },
              {
                label: 'Revenue',
                data: [8, 15, 7, 12, 9],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
              }
            ]
          },
          color: '#8B5CF6',
          size: 80,
          position: { x: 0, y: 4 }
        }
      },
      {
        id: 'table-1',
        type: 'table',
        label: '',
        properties: {
          tableData: {
            headers: ['Name', 'Age', 'City', 'Role'],
            rows: [
              ['John Doe', '25', 'New York', 'Developer'],
              ['Jane Smith', '30', 'Los Angeles', 'Designer'],
              ['Bob Johnson', '35', 'Chicago', 'Manager'],
              ['Alice Brown', '28', 'Houston', 'Analyst']
            ]
          },
          color: '#F97316',
          size: 60,
          position: { x: 4, y: 4 }
        }
      }
    ];

    const defaultLayout = [
      { i: 'text-1', x: 0, y: 0, w: 4, h: 3 },
      { i: 'image-1', x: 4, y: 0, w: 4, h: 3 },
      { i: 'chart-1', x: 0, y: 3, w: 6, h: 4 },
      { i: 'table-1', x: 6, y: 3, w: 6, h: 4 }
    ];

    const updatedLayout = {
      ...currentLayout,
      layout: defaultLayout,
      elements: defaultElements,
      updatedAt: new Date()
    };

    setLayouts(prev => prev.map(l => l.id === currentLayoutId ? updatedLayout : l));
    setEditingElement(null);
    setSelectedType(null);
  };

  const handleLayoutSave = async (layout: Layout) => {
    if (layout.id === 'default') {
      try {
        const response = await fetch('http://localhost:3001/api/layouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: layout.name,
            description: layout.description,
            layout: layout.layout,
            elements: layout.elements
          }),
        });

        if (response.ok) {
          const result = await response.json();
          alert('Layout created successfully!');
          console.log('Created layout:', result);
        } else {
          const error = await response.json();
          alert(`Error creating layout: ${error.message}`);
        }
      } catch (error) {
        console.error('Error creating layout:', error);
        alert('Failed to create layout. Please check your connection.');
      }

      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/layouts/${layout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: layout.name,
          description: layout.description,
          layout: layout.layout,
          elements: layout.elements
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Layout updated successfully!');
        console.log('Updated layout:', result);
      } else {
        const error = await response.json();
        alert(`Error updating layout: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating layout:', error);
      alert('Failed to update layout. Please check your connection.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading layouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar 
        onAddElement={handleAddElement}
        onUpdateElement={handleElementUpdate}
        onDeleteElement={handleElementDelete}
        editingElement={editingElement}
        setEditingElement={setEditingElement}
        setSelectedType={setSelectedType}
        selectedType={selectedType}
        currentLayoutId={currentLayoutId}
      />
      <div className="flex-1 flex flex-col">
        <LayoutManager
          layouts={layouts}
          currentLayoutId={currentLayoutId}
          onLayoutSelect={handleLayoutSelect}
          onLayoutCreate={handleLayoutCreate}
          onLayoutUpdate={handleLayoutUpdate}
          onLayoutDelete={handleLayoutDelete}
          onLayoutSave={handleLayoutSave}
          onReplaceWithDefaults={handleReplaceWithDefaults}
        />
        <Grid 
          layouts={layouts}
          currentLayoutId={currentLayoutId}
          onLayoutChange={handleLayoutChange}
          setEditingElement={setEditingElement}
        />
      </div>
    </div>
  );
};

export default App;