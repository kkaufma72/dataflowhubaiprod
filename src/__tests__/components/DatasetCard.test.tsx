import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatasetCard from '../../components/data/DatasetCard';
import { Dataset } from '../../types';

describe('DatasetCard', () => {
  const mockDataset: Dataset = {
    id: 'test-dataset-1',
    name: 'Test Dataset',
    description: 'A test dataset for unit testing',
    rows: 1000,
    columns: 10,
    dateUploaded: '2023-01-01T00:00:00Z',
    fileType: 'csv',
    fileSize: '2.5 MB',
    projectId: 'project-1'
  };

  const mockOnPreview = vi.fn();
  const mockOnAnalyze = vi.fn();

  beforeEach(() => {
    mockOnPreview.mockClear();
    mockOnAnalyze.mockClear();
  });

  it('renders dataset information correctly', () => {
    render(
      <DatasetCard 
        dataset={mockDataset} 
        onPreview={mockOnPreview} 
        onAnalyze={mockOnAnalyze} 
      />
    );

    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
    expect(screen.getByText('A test dataset for unit testing')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Assumes toLocaleString() for rows
    expect(screen.getByText('10')).toBeInTheDocument(); // Assumes columns are rendered directly
    expect(screen.getByText('CSV')).toBeInTheDocument(); // Assumes fileType is uppercased
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    expect(screen.getByText(/Uploaded on Jan 1, 2023/)).toBeInTheDocument(); // More specific date check
  });

  it('calls onPreview when Preview button is clicked', () => {
    render(
      <DatasetCard 
        dataset={mockDataset} 
        onPreview={mockOnPreview} 
        onAnalyze={mockOnAnalyze} 
      />
    );

    fireEvent.click(screen.getByText('Preview'));
    expect(mockOnPreview).toHaveBeenCalledWith(mockDataset);
  });

  it('calls onAnalyze when Analyze button is clicked', () => {
    render(
      <DatasetCard 
        dataset={mockDataset} 
        onPreview={mockOnPreview} 
        onAnalyze={mockOnAnalyze} 
      />
    );

    fireEvent.click(screen.getByText('Analyze'));
    expect(mockOnAnalyze).toHaveBeenCalledWith(mockDataset);
  });

  it('handles missing optional properties gracefully', () => {
    const minimalDataset: Dataset = {
      id: 'minimal-dataset',
      name: 'Minimal Dataset',
      description: '', // Empty description is fine
      rows: null as any,
      columns: null as any,
      dateUploaded: null as any,
      fileType: null as any,
      fileSize: null as any,
      projectId: 'project-1'
    };

    render(
      <DatasetCard 
        dataset={minimalDataset} 
        onPreview={mockOnPreview} 
        onAnalyze={mockOnAnalyze} 
      />
    );

    expect(screen.getByText('Minimal Dataset')).toBeInTheDocument();
    
    const rowsLabel = screen.getByText('Rows');
    const rowsValueContainer = rowsLabel.parentElement!;
    expect(within(rowsValueContainer).getByText('N/A')).toBeInTheDocument();

    const colsLabel = screen.getByText('Columns');
    const colsValueContainer = colsLabel.parentElement!;
    expect(within(colsValueContainer).getByText('N/A')).toBeInTheDocument();

    const formatLabel = screen.getByText('Format');
    const formatValueContainer = formatLabel.parentElement!;
    expect(within(formatValueContainer).getByText('N/A')).toBeInTheDocument();
    
    const sizeLabel = screen.getByText('Size');
    const sizeValueContainer = sizeLabel.parentElement!;
    expect(within(sizeValueContainer).getByText('N/A')).toBeInTheDocument();

    expect(screen.getByText(/Uploaded on N\/A/)).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(
      <DatasetCard 
        dataset={mockDataset} 
        onPreview={mockOnPreview} 
        onAnalyze={mockOnAnalyze} 
      />
    );
    // Check for specific parts of the formatted date
    expect(screen.getByText(/Uploaded on Jan 1, 2023/)).toBeInTheDocument();
  });
});