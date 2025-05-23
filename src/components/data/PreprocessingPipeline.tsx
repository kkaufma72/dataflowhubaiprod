import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import {
  Wand2,
  Plus,
  X,
  ArrowDown,
  ArrowUp,
  Edit,
  Save,
  Trash2,
  Code,
  RefreshCw,
  Play,
  Check,
  Settings,
  Eye,
  Download,
  AlertTriangle,
  Info // Added Info icon import
} from 'lucide-react';
import { Dataset } from '../../types';
import {
  PreprocessingOptions,
  PreprocessingResult,
  applyPreprocessingPipeline, // This was commented out, but needed for local processing simulation
  PreprocessingRecommendation
} from '../../lib/dataProcessing';
import toast from 'react-hot-toast';
import DataProfiler from './DataProfiler';
import BatchProcessingManager from './BatchProcessingManager';
import StreamingDataProcessor from './StreamingDataProcessor';
import { supabase } from '../../lib/supabase'; // Import Supabase client

interface PreprocessingPipelineProps {
  dataset: Dataset;
  onPreprocessingComplete: (result: PreprocessingResult) => void;
}

const PreprocessingPipeline: React.FC<PreprocessingPipelineProps> = ({
  dataset,
  onPreprocessingComplete
}) => {
  const [preprocessingOptions, setPreprocessingOptions] = useState<PreprocessingOptions>({
    missingValues: {
      strategy: 'impute_mean',
      columns: undefined,
      threshold: 0.5
    },
    outliers: {
      strategy: 'cap',
      method: 'iqr',
      threshold: 1.5
    },
    encoding: {
      strategy: 'one_hot',
      columns: undefined,
      handleUnknown: 'ignore'
    },
    scaling: {
      strategy: 'standard',
      columns: undefined
    },
    batchSize: 1000,
    storeIntermediateResults: false
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'pipeline' | 'batch' | 'streaming'>('profile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewData, setPreviewData] = useState<{
    original: any[][];
    processed: any[][];
    columns: string[];
  } | null>(null);
  const [processingResult, setProcessingResult] = useState<PreprocessingResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null); // Added state for pipeline error

  // Apply preprocessing recommendations
  const handleApplyRecommendations = (recommendations: PreprocessingRecommendation[]) => {
    const newOptions: PreprocessingOptions = { ...preprocessingOptions };

    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'missing_values':
          newOptions.missingValues = {
            ...newOptions.missingValues,
            strategy: rec.suggestedMethod as any,
            columns: rec.column ? [rec.column] : undefined
          };
          break;
        case 'outliers':
          newOptions.outliers = {
            ...newOptions.outliers,
            strategy: rec.suggestedMethod.includes('cap') ? 'cap' : 'remove',
            method: 'iqr',
            columns: rec.column ? [rec.column] : undefined
          };
          break;
        case 'encoding':
          newOptions.encoding = {
            ...newOptions.encoding,
            strategy: rec.suggestedMethod as any,
            columns: rec.column ? [rec.column] : undefined
          };
          break;
        case 'scaling':
          newOptions.scaling = {
            ...newOptions.scaling,
            strategy: rec.suggestedMethod as any,
            columns: rec.column ? [rec.column] : undefined
          };
          break;
        case 'feature_selection':
          newOptions.featureSelection = {
            ...newOptions.featureSelection,
            strategy: rec.suggestedMethod as any,
            threshold: 0.01
          };
          break;
        case 'dimensionality_reduction':
          newOptions.dimensionalityReduction = {
            ...newOptions.dimensionalityReduction,
            strategy: rec.suggestedMethod as any,
            components: 5
          };
          break;
      }
    });

    setPreprocessingOptions(newOptions);
    setActiveTab('pipeline');
    toast.success('Recommendations applied to pipeline');
  };

  // Run preprocessing pipeline
  const runPreprocessing = async () => {
    if (!dataset.previewData) {
      toast.error('No data available for preprocessing');
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setPipelineError(null); // Clear previous error
    
    try {
      // Simulate progress updates if processing locally
      let progressInterval: NodeJS.Timeout | undefined;
      
      // Check if running in a local dev environment without the backend function
      // This is a simple check, you might need a more robust way depending on your setup
      const isLocalDev = typeof supabase.functions.invoke === 'undefined'; // Example check

      if (isLocalDev) {
         progressInterval = setInterval(() => {
            setProcessingProgress(prev => {
              const newProgress = prev + Math.random() * 10;
              return newProgress >= 100 ? 100 : newProgress;
            });
          }, 200);
      }

      let result: PreprocessingResult;
      let error: any;

      // Decide whether to call backend or run locally
      if (!isLocalDev && dataset.id) { // Call backend if not local dev and dataset has ID
         // Corrected syntax: removed extraneous 'p'
         const { data: backendResult, error: backendError } = await supabase.functions.invoke('run-preprocessing', {
            body: {
              datasetId: dataset.id,
              options: preprocessingOptions,
            },
          });
          result = backendResult;
          error = backendError;

      } else { // Run locally using applyPreprocessingPipeline if local dev or no dataset ID
         // The applyPreprocessingPipeline function needs to be imported if used locally
         // import { applyPreprocessingPipeline } from '../../lib/dataProcessing';
         // Ensure applyPreprocessingPipeline is available and correctly implemented for local use
         if (dataset.previewData) {
            const { columns, rows } = dataset.previewData;
            result = applyPreprocessingPipeline(rows, columns, preprocessingOptions); // Assuming this function exists and works locally
            error = null;
         } else {
            throw new Error('No preview data available for local preprocessing.');
         }

         // Clear interval after local processing simulation
         if (progressInterval) clearInterval(progressInterval);
         setProcessingProgress(100); // Set to 100% immediately for local simulation
      }


      if (error) {
        throw error;
      }

      const processedData: any[][] = result.data;
      const processedColumns: string[] = result.columns;

      setProcessingResult(result);
      setPreviewData({
        original: dataset.previewData?.rows?.slice(0, 5) || [],
        processed: processedData.slice(0, 5),
        columns: processedColumns,
      });

      setShowPreview(true);

      if (!isLocalDev) { // Only show success toast and set processing false after backend call completes
         setProcessingProgress(100);
         toast.success('Preprocessing completed successfully!', { id: 'preprocessing-toast' });
         setIsProcessing(false);
      } else { // For local simulation, setIsProcessing(false) after the timeout in the original code
          // This timeout logic was removed with the interval cleanup, 
          // let's add a small delay for the local simulation to feel complete.
           setTimeout(() => {
             setIsProcessing(false);
             toast.success('Preprocessing completed successfully (Local Simulation)!', { id: 'preprocessing-toast' });
           }, 500);
      }

    } catch (error: any) {
      console.error('Preprocessing error:', error);
       if (progressInterval) clearInterval(progressInterval); // Clear interval on error
       setProcessingProgress(0); // Reset progress on error
      setIsProcessing(false);
      const errorMessage = error.message || 'An unknown error occurred during preprocessing.';
      toast.error(`Preprocessing failed: ${errorMessage}`, { id: 'preprocessing-toast' });
      setPipelineError(errorMessage); 
    }
  };

  // Handle batch processing completion
  const handleBatchProcessingComplete = (result: PreprocessingResult) => {
    setProcessingResult(result);
    onPreprocessingComplete(result);
  };

  // Handle streaming data processing
  const handleStreamingDataProcessed = (processedData: any[][], columns: string[]) => {
    setPreviewData({
      original: dataset.previewData?.rows.slice(0, 5) || [],
      processed: processedData.slice(0, 5),
      columns
    });
  };

  // Save preprocessing result
  const savePreprocessingResult = () => {
    if (!processingResult) return;

    onPreprocessingComplete(processingResult);
    toast.success('Preprocessing result saved');
  };

  return (
    <div className="space-y-6"> {/* Corrected className syntax */}
      <div className="mb-6"> {/* Corrected className syntax */}
        <div className="border-b border-gray-200"> {/* Corrected className syntax */}
          <nav className="-mb-px flex space-x-8"> {/* Corrected className syntax */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Profile
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preprocessing Pipeline
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'batch'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Batch Processing
            </button>
            <button
              onClick={() => setActiveTab('streaming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'streaming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Streaming
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'profile' && (
        <DataProfiler
          dataset={dataset}
          onApplyRecommendations={handleApplyRecommendations}
        />
      )}

      {activeTab === 'pipeline' && (
        <Card>
          {/* Corrected className syntax throughout this block */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                <Wand2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Preprocessing Pipeline</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Configure and run data preprocessing steps
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {processingResult && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              )}
              <Button
                onClick={runPreprocessing}
                disabled={isProcessing}
                icon={isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              >
                {isProcessing ? 'Processing...' : 'Run Pipeline'}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Pipeline Configuration</h4>
            
            <div className="space-y-6">
              {/* Missing Values */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Missing Values</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-missing-values"
                      checked={!!preprocessingOptions.missingValues}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            missingValues: {
                              strategy: 'impute_mean',
                              threshold: 0.5
                            }
                          });
                        } else {
                          const { missingValues, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-missing-values" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
                
                {preprocessingOptions.missingValues && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Strategy
                      </label>
                      <select
                        value={preprocessingOptions.missingValues.strategy}
                        onChange={(e) => setPreprocessingOptions({
                          ...preprocessingOptions,
                          missingValues: {
                            ...preprocessingOptions.missingValues,
                            strategy: e.target.value as any
                          }
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="drop_rows">Drop Rows</option>
                        <option value="drop_columns">Drop Columns</option>
                        <option value="impute_mean">Impute with Mean</option>
                        <option value="impute_median">Impute with Median</option>
                        <option value="impute_mode">Impute with Mode</option>
                        <option value="impute_constant">Impute with Constant</option>
                      </select>
                    </div>
                    
                    {preprocessingOptions.missingValues.strategy === 'impute_constant' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Constant Value
                        </label>
                        <input
                          type="text"
                          value={preprocessingOptions.missingValues.constantValue || ''}
                          onChange={(e) => setPreprocessingOptions({
                            ...preprocessingOptions,
                            missingValues: {
                              ...preprocessingOptions.missingValues,
                              constantValue: e.target.value
                            }
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Value to use for imputation"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Missing Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={preprocessingOptions.missingValues.threshold || 0.5}
                        onChange={(e) => setPreprocessingOptions({
                          ...preprocessingOptions,
                          missingValues: {
                            ...preprocessingOptions.missingValues,
                            threshold: parseFloat(e.target.value)
                          }
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Threshold for dropping columns (if strategy is 'drop_columns')
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Outliers */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Outliers</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-outliers"
                      checked={!!preprocessingOptions.outliers}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            outliers: {
                              strategy: 'cap',
                              method: 'iqr',
                              threshold: 1.5
                            }
                          });
                        } else {
                          const { outliers, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-outliers" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Encoding */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Categorical Encoding</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-encoding"
                      checked={!!preprocessingOptions.encoding}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            encoding: {
                              strategy: 'one_hot',
                              handleUnknown: 'ignore'
                            }
                          });
                        } else {
                          const { encoding, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-encoding" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Scaling */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Feature Scaling</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-scaling"
                      checked={!!preprocessingOptions.scaling}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            scaling: {
                              strategy: 'standard'
                            }
                          });
                        } else {
                          const { scaling, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-scaling" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Feature Selection */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Feature Selection</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-feature-selection"
                      checked={!!preprocessingOptions.featureSelection}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            featureSelection: {
                              strategy: 'variance',
                              threshold: 0.01
                            }
                          });
                        } else {
                          const { featureSelection, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-feature-selection" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Dimensionality Reduction */}
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Dimensionality Reduction</h5>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-dim-reduction"
                      checked={!!preprocessingOptions.dimensionalityReduction}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreprocessingOptions({
                            ...preprocessingOptions,
                            dimensionalityReduction: {
                              strategy: 'pca',
                              components: 5
                            }
                          });
                        } else {
                          const { dimensionalityReduction, ...rest } = preprocessingOptions;
                          setPreprocessingOptions(rest);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-dim-reduction" className="ml-2 block text-sm text-gray-900">
                      Enable
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {isProcessing && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Processing</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {showPreview && previewData && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Row
                        </th>
                        {previewData.columns.map((column, i) => (
                          <th 
                            key={i} 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.processed.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {cell !== null && cell !== undefined ? cell.toString() : 'null'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={savePreprocessingResult}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save Preprocessed Dataset
                  </Button>
                </div>
              </div>
            )}
            
            {pipelineError && (
              <div className="mt-4 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2"/>
                <span>Error: {pipelineError}</span>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Preprocessing Pipeline Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This pipeline will apply the following transformations in order:
                    </p>
                    <ol className="mt-2 list-decimal list-inside space-y-1">
                      {preprocessingOptions.missingValues && (
                        <li>Handle missing values using {preprocessingOptions.missingValues.strategy.replace(/_/g, ' ')}</li>
                      )}
                      {preprocessingOptions.outliers && (
                        <li>{preprocessingOptions.outliers.strategy.replace(/_/g, ' ')} outliers using {preprocessingOptions.outliers.method.replace(/_/g, ' ')} method</li>
                      )}
                      {preprocessingOptions.encoding && (
                        <li>Apply {preprocessingOptions.encoding.strategy.replace(/_/g, ' ')} encoding to categorical features</li>
                      )}
                      {preprocessingOptions.scaling && (
                        <li>Apply {preprocessingOptions.scaling.strategy.replace(/_/g, ' ')} to numeric features</li>
                      )}
                      {preprocessingOptions.featureSelection && (
                        <li>Select features using {preprocessingOptions.featureSelection.strategy.replace(/_/g, ' ')} method</li>
                      )}
                      {preprocessingOptions.dimensionalityReduction && (
                        <li>Reduce dimensionality using {preprocessingOptions.dimensionalityReduction.strategy.toUpperCase()}</li>
                      )}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'batch' && (
        <BatchProcessingManager
          dataset={dataset}
          preprocessingOptions={preprocessingOptions}
          onProcessingComplete={handleBatchProcessingComplete}
        />
      )}

      {activeTab === 'streaming' && (
        <StreamingDataProcessor
          dataset={dataset}
          preprocessingOptions={preprocessingOptions}
          onDataProcessed={handleStreamingDataProcessed}
        />
      )}
    </div>
  );
};

export default PreprocessingPipeline;