/*
import { handleDataChatQuery } from './dataChatService';
import { Dataset } from '../src/types';

describe('handleDataChatQuery', () => {
  const mockDatasets: Dataset[] = [
    { id: 'dataset1', name: 'Sales Data Q1', data: [], metadata: { size: 100, type: 'csv', columns: ['colA', 'colB'], rowCount: 10 } },
    { id: 'dataset2', name: 'Sales Data Q2', data: [], metadata: { size: 200, type: 'json', columns: ['colX', 'colY', 'colZ'], rowCount: 20 } },
    { id: 'dataset3', name: 'Marketing Data', data: [], metadata: { size: 300, type: 'csv', columns: ['colM', 'colN'], rowCount: 30 } },
    { id: 'dataset4', name: 'Sales Data Q3', data: [], metadata: { size: 250, type: 'json', columns: ['colP', 'colQ', 'colR'], rowCount: 25 } },
  ];

  it('should return a message indicating no datasets are loaded when no datasets are provided', async () => {
    const query = 'Tell me about my data.';
    const response = await handleDataChatQuery(query, []);
    expect(response).toBe('No datasets are currently loaded.');
  });

  it('should return the number of loaded datasets', async () => {
    const query = 'How many datasets do I have?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('You have 4 datasets loaded.'); // Adjusted based on mockDatasets length
  });

  it('should return the number of rows in a specific dataset using the exact name', async () => {
    const query = 'How many rows are in Sales Data Q1?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q1 has 10 rows.');
  });

  it('should return the number of columns in a specific dataset using the exact name', async () => {
    const query = 'How many columns are in Sales Data Q2?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q2 has 3 columns.');
  });

  it('should return the column names in a specific dataset using the exact name', async () => {
    const query = 'What are the column names in Sales Data Q1?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q1 has the following columns: colA, colB.');
  });

  it('should return the file type of a specific dataset', async () => {
    const query = 'What is the file type of Marketing Data?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Marketing Data is of type csv.');
  });

  it('should return the file size of a specific dataset', async () => {
    const query = 'What is the size of Sales Data Q1?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q1 is 100 bytes.');
  });
  
  it('should acknowledge mention of a dataset if question is unclear', async () => {
    const query = 'Tell me something about Sales Data Q2.';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Okay, you mentioned Sales Data Q2. What would you like to know about it? You can ask about its rows, columns, type, size, or column names.');
  });

  it('should list the loaded datasets', async () => {
    const query = 'List my datasets.';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Your loaded datasets are: Sales Data Q1, Sales Data Q2, Marketing Data, Sales Data Q3.');
  });

  it('should handle general questions about datasets when no datasets are specified', async () => {
    const query = 'What kind of data can I use?';
    const response = await handleDataChatQuery(query, mockDatasets); // Test with datasets loaded but no specific one asked
    expect(response).toBe('You can load various types of datasets like CSV, JSON, etc. How can I help you with your datasets?');
  });

  it('should return a fallback message for unhandled questions', async () => {
    const query = 'Tell me a joke.';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('I am designed to answer questions about your datasets. How can I help with that?');
  });

  it('should handle queries for a non-existent dataset by name', async () => {
    const query = 'How many rows are in NonExistent Dataset?';
    const response = await handleDataChatQuery(query, mockDatasets);
    // The current implementation might fall back to a general dataset question or the final fallback.
    // Depending on desired behavior, this might be: 'You can load various types of datasets...' or the final fallback.
    expect(response).toBe('You can load various types of datasets like CSV, JSON, etc. How can I help you with your datasets?');
  });

  it('should handle case-insensitive dataset names in queries', async () => {
    const query = 'how many rows are in sales data q1?';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q1 has 10 rows.');
  });

  it('should handle queries with extra spacing around dataset names or keywords', async () => {
    const query = '  How many columns are in   Sales Data Q2  ?  ';
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('Sales Data Q2 has 3 columns.');
  });

  it('should ask for clarification when multiple datasets are vaguely mentioned', async () => {
    // This test assumes the updated logic in handleDataChatQuery that asks for clarification.
    const query = 'Tell me about Sales Data.'; // Vague query that could match multiple
    const response = await handleDataChatQuery(query, mockDatasets);
    expect(response).toBe('I found mentions of multiple datasets: Sales Data Q1, Sales Data Q2, Sales Data Q3. Could you please focus on one or clarify your question?');
  });
});
*/