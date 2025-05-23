import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Adjust the import path if necessary

// Initialize Supabase client
const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key for backend processing
);

// Define the storage bucket name
const SUPABASE_STORAGE_BUCKET = 'datasets';

interface ProcessDatasetPayload {
  bucketName: string;
  filePath: string;
  projectId?: string; // Assuming projectId might be passed
  userId?: string; // Assuming userId might be passed
}

// Helper function for structured logging
const log = (level: 'info' | 'error' | 'warn', message: string, context?: any) => {
  console[level](JSON.stringify({ message, level, ...context }));
};

Deno.serve(async (req) => {
  // Generate a request ID for tracing
  const requestId = crypto.randomUUID();

  if (req.method !== 'POST') {
    log('warn', 'Method Not Allowed', { requestId, method: req.method });
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload: ProcessDatasetPayload;
  try {
    payload = await req.json();
  } catch (error) {
     log('error', 'Failed to parse request body as JSON', { requestId, error: error.message });
     return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { bucketName, filePath, projectId, userId } = payload;
  const context = { requestId, bucketName, filePath, projectId, userId };

  log('info', 'Processing dataset file', context);

  try {
    // *** Input Validation ***
    if (!bucketName || typeof bucketName !== 'string') {
      log('error', 'Validation Error: Missing or invalid bucketName', context);
      return new Response(JSON.stringify({ error: 'Missing or invalid bucketName' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!filePath || typeof filePath !== 'string') {
       log('error', 'Validation Error: Missing or invalid filePath', context);
      return new Response(JSON.stringify({ error: 'Missing or invalid filePath' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Add validation for projectId and userId if they are expected
    // if (projectId && typeof projectId !== 'string') { log('error', 'Validation Error: Invalid projectId', context); ... }
    // if (userId && typeof userId !== 'string') { log('error', 'Validation Error: Invalid userId', context); ... }

    if (bucketName !== SUPABASE_STORAGE_BUCKET) {
      log('error', 'Validation Error: Invalid bucket name', context);
      return new Response('Invalid bucket name', { status: 400 });
    }
    log('info', 'Input validation successful', context);
    // *** End Input Validation ***

    // 1. Read the file content from Supabase Storage
    log('info', 'Attempting to download file', context);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError) {
      log('error', 'Error downloading file', { ...context, error: downloadError.message });
      return new Response('Failed to download file', { status: 500 });
    }

    if (!fileData) {
        log('error', 'File data is empty after download', context);
        return new Response('File data is empty', { status: 404 });
    }
    log('info', 'File downloaded successfully', context);

    // Convert Blob to text (assuming text-based files like CSV, JSON)
    const fileContent = await fileData.text();

    // 2. Implement secure parsing and validation logic here
    log('info', 'Starting file content parsing and validation', context);
    // --- Placeholder for Parsing and Validation Logic ---
    // Based on file type (you might need to infer or pass this) implement parsing.
    // Use libraries that are safe for backend parsing (e.g., 'csv-parser', 'json5')
    // Implement thorough validation of the parsed data structure and content.
    // Handle errors gracefully for malformed files.
    const processedData = { columns: [], rows: [] }; // Replace with actual parsed data
    // -------------------------------------------------------
    log('info', 'File content parsing and validation complete (placeholder)', context);

    // 3. Process the data and update the database
    // --- Placeholder for Database Update Logic ---
    log('info', 'Starting database update with dataset info (placeholder)', context);
    // Example: Insert a record into a 'datasets' table
    // const { data: datasetRecord, error: dbError } = await supabase
    //   .from('datasets')
    //   .insert([
    //     { 
    //       project_id: projectId, // assuming projectId is in payload
    //       file_path: filePath,
    //       file_name: filePath.split('/').pop(),
    //       // ... other metadata from parsedData or payload
    //     }
    //   ]);

    // if (dbError) {
    //   log('error', 'Error inserting dataset record', { ...context, error: dbError.message });
    //   return new Response('Failed to update database', { status: 500 });
    // }
    // ---------------------------------------------
    log('info', 'Database update complete (placeholder)', context);

    log('info', 'File processed successfully', context);
    return new Response(JSON.stringify({ message: 'File processed successfully', filePath }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    log('error', 'Supabase Function error', { ...context, error: error instanceof Error ? error.message : 'An unknown error occurred', stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
