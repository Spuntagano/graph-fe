import React, { useState, useEffect } from 'react';
import { Element, Layout } from '../types';

interface SidebarProps {
  onAddElement: (element: Element) => void;
  onUpdateElement?: (elementId: string, updates: Partial<Element>) => void;
  onDeleteElement?: (elementId: string) => void;
  editingElement?: Element | null;
  setEditingElement: (element: Element | null) => void;
  setSelectedType: (type: 'text' | 'image' | 'chart' | 'table' | null) => void;
  selectedType: 'text' | 'image' | 'chart' | 'table' | null;
  currentLayoutId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddElement, onUpdateElement, onDeleteElement, editingElement, setEditingElement, setSelectedType, selectedType, currentLayoutId }) => {
  const [textContent, setTextContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [chartData, setChartData] = useState('');
  const [tableData, setTableData] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingElement) {
      setSelectedType(editingElement.type);
      setTextContent(editingElement.label || '');
      setImageUrl(editingElement.properties?.url || '');
      setChartData(formatChartDataForInput(editingElement.properties?.chartData));
      setTableData(formatTableDataForInput(editingElement.properties?.tableData));
      setSelectedType(editingElement.type);
      setShowForm(true);
    } else {
      setTextContent('');
      setImageUrl('');
      setChartData('');
      setTableData('');
    }
  }, [editingElement]);

  useEffect(() => {
    setSelectedType(null);
    setEditingElement(null);
    setTextContent('');
    setImageUrl('');
    setChartData('');
    setTableData('');
  }, [currentLayoutId]);

  const formatChartDataForInput = (chartData: any) => {
    if (!chartData) return '';
    try {
      const labels = chartData.labels.join(',');
      const datasets = chartData.datasets.map((dataset: any) => 
        `${dataset.label}:${dataset.data.join(',')}`
      ).join('|');
      return `${labels}|${datasets}`;
    } catch (error) {
      return '';
    }
  };

  const formatTableDataForInput = (tableData: any) => {
    if (!tableData) return '';
    try {
      const headers = tableData.headers.join(',');
      const rows = tableData.rows.map((row: string[]) => row.join(',')).join('\n');
      return `${headers}\n${rows}`;
    } catch (error) {
      return '';
    }
  };

  const elementTypes = [
    { type: 'text', label: 'Text', icon: 'T', color: 'bg-blue-500' },
    { type: 'image', label: 'Image', icon: '🖼️', color: 'bg-green-500' },
    { type: 'chart', label: 'Chart', icon: '📊', color: 'bg-purple-500' },
    { type: 'table', label: 'Table', icon: '📋', color: 'bg-orange-500' }
  ];

  const handleSubmit = () => {
    if (selectedType === 'text' && !textContent.trim()) return;
    if (selectedType === 'image' && !imageUrl.trim()) return;
    if (selectedType === 'chart' && !chartData.trim()) return;
    if (selectedType === 'table' && !tableData.trim()) return;
    if (!selectedType) return;

    if (editingElement && onUpdateElement) {
      // Update existing element
      const updates: Partial<Element> = {
        label: selectedType === 'text' ? textContent : '',
        properties: {
          ...editingElement.properties,
          ...(selectedType === 'image' && { url: imageUrl }),
          ...(selectedType === 'chart' && { 
            type: 'bar',
            chartData: parseChartData(chartData)
          }),
          ...(selectedType === 'table' && { 
            tableData: parseTableData(tableData)
          })
        }
      };
      onUpdateElement(editingElement.id, updates);
    } else {
      const newElement: Element = {
        id: `${selectedType}-${Date.now()}`,
        type: selectedType,
        label: selectedType === 'text' ? textContent : '',
        properties: {
          color: getDefaultColor(selectedType),
          size: getDefaultSize(selectedType),
          position: { x: 100, y: 100 },
          ...(selectedType === 'image' && { url: imageUrl }),
          ...(selectedType === 'chart' && { 
            type: 'bar',
            chartData: parseChartData(chartData)
          }),
          ...(selectedType === 'table' && { 
            tableData: parseTableData(tableData)
          })
        }
      };
      onAddElement(newElement);
    }

    setTextContent('');
    setImageUrl('');
    setChartData('');
    setTableData('');
    setShowForm(false);
  };

  const parseChartData = (dataString: string) => {
    try {
      const parts = dataString.split('|');
      if (parts.length < 2) return null;

      const labels = parts[0].split(',').map(l => l.trim());
      const datasets = parts.slice(1).map((dataset, index) => {
        const [label, ...values] = dataset.split(':');
        return {
          label: label.trim(),
          data: values[0].split(',').map(v => parseFloat(v.trim())),
          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
          borderColor: `hsl(${index * 60}, 70%, 40%)`,
          borderWidth: 1
        };
      });

      return { labels, datasets };
    } catch (error) {
      console.error('Error parsing chart data:', error);
      return null;
    }
  };

  const parseTableData = (dataString: string) => {
    try {
      const lines = dataString.split('\n').filter(line => line.trim());
      if (lines.length < 2) return null;

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim())
      );

      return { headers, rows };
    } catch (error) {
      console.error('Error parsing table data:', error);
      return null;
    }
  };

  const getDefaultColor = (type: string) => {
    switch (type) {
      case 'text': return '#3B82F6';
      case 'image': return '#10B981';
      case 'chart': return '#8B5CF6';
      case 'table': return '#F97316';
      default: return '#6B7280';
    }
  };

  const getDefaultSize = (type: string) => {
    switch (type) {
      case 'text': return 16;
      case 'image': return 100;
      case 'chart': return 80;
      case 'table': return 60;
      default: return 40;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Elements</h2>
        <p className="text-sm text-gray-600">Add elements to your graph</p>
      </div>

      {/* Element Types */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Element Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {elementTypes.map((element) => (
            <button
              key={element.type}
              onClick={() => {
                setSelectedType(element.type as 'text' | 'image' | 'chart' | 'table');
                setShowForm(true);
                setEditingElement(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                selectedType === element.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 ${element.color} rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto`}>
                {element.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{element.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Element Form */}
      {showForm && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Add {elementTypes.find(e => e.type === selectedType)?.label}
          </h3>
          
          <div className="space-y-4">
            {selectedType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter text content..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}
            {selectedType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}
            {selectedType === 'chart' && (
               <>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Chart Data
                   </label>
                   <textarea
                     value={chartData}
                     onChange={(e) => setChartData(e.target.value)}
                     placeholder="Labels: Jan,Feb,Mar|Sales:10,20,15|Profit:5,12,8"
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Format: Labels separated by commas, datasets separated by |, values separated by :
                   </p>
                 </div>
               </>
             )}
             {selectedType === 'table' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Table Data
                 </label>
                 <textarea
                   value={tableData}
                   onChange={(e) => setTableData(e.target.value)}
                   placeholder="Name,Age,City&#10;John,25,New York&#10;Jane,30,Los Angeles&#10;Bob,35,Chicago"
                   rows={6}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   Format: First line contains headers, each subsequent line is a row. Separate columns with commas.
                 </p>
               </div>
             )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={
                  selectedType === 'text' ? !textContent.trim() : 
                  selectedType === 'image' ? !imageUrl.trim() : 
                  selectedType === 'chart' ? !chartData.trim() :
                  !tableData.trim()
                }
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {editingElement ? 'Update Element' : 'Add Element'}
              </button>
              {editingElement && onDeleteElement && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this element?')) {
                      onDeleteElement(editingElement.id);
                      setShowForm(false);
                      setSelectedType(null);
                      setEditingElement(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              )}
              <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedType(null);
                    if (editingElement && onUpdateElement) {
                      onUpdateElement(editingElement.id, {});
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Sidebar; 