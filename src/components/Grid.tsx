import React, { useState } from 'react';
import GridLayout, { Layout as GridLayoutType } from "react-grid-layout";
import { Element, Layout } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GridProps {
  layouts: Layout[];
  currentLayoutId: string;
  onLayoutChange: (newLayout: GridLayoutType[]) => void;
  setEditingElement: (element: Element | null) => void;
}

const Grid: React.FC<GridProps> = ({ 
  layouts, 
  currentLayoutId, 
  onLayoutChange,
  setEditingElement,
}) => {

  const currentLayout = layouts.find(l => l.id === currentLayoutId);
  const layout = currentLayout?.layout || [];
  const elements = currentLayout?.elements || [];

  const handleDragStart = (layout: GridLayoutType[], oldItem: GridLayoutType, newItem: GridLayoutType, placeholder: any, e: any, element: any) => {
    const draggedElement = elements.find(el => el.id === newItem.i);
    if (draggedElement) {
      setEditingElement(draggedElement);
    }
  };

  const renderGridItem = (element: Element) => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            key={element.id}
            className="w-full h-full bg-white border border-gray-300 rounded-md p-3 flex items-start justify-start overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="text-sm leading-relaxed break-words">
              {element.label}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div 
            key={element.id}
            className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors relative group"
          >
            <img src={element.properties.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">
                Click to edit
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div 
            key={element.id}
            className="w-full h-full bg-white border border-gray-300 rounded-md p-2 cursor-pointer hover:border-blue-400 transition-colors relative group"
          >
                <div className="w-full h-full">
                    {element.properties.chartData && <Bar
                        data={element.properties.chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top' as const,
                                },
                            },
                        }}
                    />}
                    {!element.properties.chartData && <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl mb-2">📊</div>
                            <span className="text-xs text-gray-600 font-medium">Invalid Chart Data</span>
                        </div>
                    </div>}
                </div>
          </div>
        );

      case 'table':
        return (
          <div 
            key={element.id}
            className="w-full h-full bg-white border border-gray-300 rounded-md overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative group"
          >
            {element.properties.tableData ? (
              <div className="w-full h-full overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {element.properties.tableData.headers.map((header: string, index: number) => (
                        <th 
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {element.properties.tableData.rows.map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell: string, cellIndex: number) => (
                          <td 
                            key={cellIndex}
                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <span className="text-xs text-gray-600 font-medium">Invalid Table Data</span>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div key={element.id} className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            {element.label}
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={1200}
          onLayoutChange={onLayoutChange}
          onDragStart={handleDragStart}
        >
          {elements.map(renderGridItem)}
        </GridLayout>
      </div>
    </div>
  );
};

export default Grid; 