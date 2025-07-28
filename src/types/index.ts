export interface Element {
  id: string;
  type: 'text' | 'image' | 'chart' | 'table';
  label: string;
  properties: Record<string, any>;
}

export interface ElementType {
  type: 'text' | 'image' | 'chart' | 'table';
  label: string;
  icon: string;
  color: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: any;
}

export interface Layout {
  id: string;
  name: string;
  description?: string;
  layout: any[]; // GridLayout items
  elements: Element[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLayoutRequest {
  name: string;
  description?: string;
  layout: any[];
  elements: Element[];
}

export interface UpdateLayoutRequest {
  name?: string;
  description?: string;
  layout?: any[];
  elements?: Element[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
} 