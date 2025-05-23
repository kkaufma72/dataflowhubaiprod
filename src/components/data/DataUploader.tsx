import React, { useState, useRef } from 'react';
import { FileUp, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useMLContext } from '../../context/MLContext';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase'; // Import supabase client
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed for unique filenames

const DataUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDataset, currentProject } = useMLContext();

  const MAX_NAME_LENGTH = 100;
  const MAX_FILE_SIZE_MB = 100; // Maximum file size in MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const SUPABASE_STORAGE_BUCKET = 'datasets'; // Define your Supabase storage bucket name

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/json', 'text/css'];
    const fileType = file.type || `text/${file.name.split('.').pop()?.toLowerCase()}`;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB} MB.`);
      setFile(null);
      return;
    }

    if (!validTypes.includes(fileType)) {
      setError('Please upload a CSV, Excel, JSON, or CSS file');
      setFile(null);
      return;
    }
    setFile(file);
  };

  const truncateFileName = (name: string): string => {
    if (name.length <= MAX_NAME_LENGTH) return name;

    const extension = name.split('.').pop() || '';
    const nameWithoutExt = name.slice(0, -(extension.length + 1));
    const maxBaseLength = MAX_NAME_LENGTH - (extension.length + 4); // 4 accounts for '...' and '.'

    return `${nameWithoutExt.slice(0, maxBaseLength)}...${extension}`;
  };

  // This parsing logic will likely be moved to a backend function for scalability
  const parseFileContent = async (file: File) => {
     // Placeholder for backend parsing logic
    console.log(`Parsing file ${file.name} on the backend...`);
    return { columns: [], rows: [] }; // Return empty data for now
  };

  const handleUpload = async () => {
    if (!file || !currentProject) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${currentProject.id}/${uniqueFileName}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Add upload progress listener if Supabase Storage SDK supports it
          // onProgress: (event) => {
          //   setUploadProgress(event.loaded / event.total * 100);
          // }
        });

      if (uploadError) {
        throw uploadError;
      }

      // File uploaded successfully, now trigger backend processing
      console.log('File uploaded successfully to Supabase Storage:', data);

      // TODO: Trigger a Supabase Function or backend process here
      // Pass the file path or public URL to the backend function

      // Simulate backend processing time
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate backend processing delay

      clearInterval(interval);
      setUploadProgress(100);

      // After backend processing is complete and dataset info is available:
      // const newDataset = { ... }; // Get dataset info from backend response
      // await addDataset(newDataset);

      setUploading(false);
      setFile(null);
      setUploadProgress(0);
      toast.success(`File "${file.name}" uploaded for processing`);
    } catch (error) {
      // clearInterval(interval); // Clear interval if it was started
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="h-full">
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg ${
          isDragging ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file && !uploading && (
          <>
            <FileUp className="w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Drag and drop your file here
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: CSV, Excel, JSON, CSS (max 100MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.json,.css"
              onChange={handleFileChange}
            />
          </>
        )}

        {file && !uploading && (
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500" />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {file.name.length > MAX_NAME_LENGTH ? truncateFileName(file.name) : file.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpload}>
                Upload
              </Button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="w-full">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2 text-indigo-500 animate-spin" />
              <span className="text-sm font-medium text-gray-900">
                {uploadProgress < 100
                  ? `Uploading ${file?.name}...`
                  : 'Processing...'}
              </span>
            </div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {uploadProgress.toFixed(0)}%
              </span>
              {uploadProgress < 100 && file && (
                <span className="text-xs text-gray-500">
                  {((file.size * (uploadProgress / 100)) / (1024 * 1024)).toFixed(2)} MB / {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center mt-4 text-sm text-red-500">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DataUploader;