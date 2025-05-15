import { Dataset } from '../types';

// Helper function to find a dataset by name (case-insensitive)
const findDatasetByName = (name: string, datasets: Dataset[]): Dataset | undefined => {
  return datasets.find(dataset => dataset.name.toLowerCase() === name.toLowerCase());
};

// This service will contain logic to process user questions
// and query the loaded datasets to generate answers.

export const answerQuestionAboutDatasets = (question: string, datasets: Dataset[]): string => {
  const lowerCaseQuestion = question.toLowerCase();

  if (!datasets || datasets.length === 0) {
    return "I don't have any datasets loaded to answer your question about.";
  }

  // Question about the number of datasets
  if (lowerCaseQuestion.includes('how many datasets') || lowerCaseQuestion.includes('number of datasets')) {
    return `You currently have ${datasets.length} dataset${datasets.length === 1 ? '' : 's'} loaded.`;
  }

  // Question asking to list datasets
  if (lowerCaseQuestion.includes('list datasets') || lowerCaseQuestion.includes('show datasets') || (lowerCaseQuestion.includes('what datasets') && lowerCaseQuestion.includes('loaded'))) {
    const datasetNames = datasets.map(d => d.name).join(', ');
    return `You currently have the following datasets loaded: ${datasetNames}.`;
  }

  // --- Enhanced Logic for Specific Dataset Questions ---

  // Try to identify a specific dataset mentioned in the question
  let targetDataset: Dataset | undefined = undefined;
  for (const dataset of datasets) {
    if (lowerCaseQuestion.includes(dataset.name.toLowerCase())) {
      targetDataset = dataset;
      break; // Found a likely target dataset
    }
  }

  if (targetDataset) {
    // Question about a specific dataset's details
    if (lowerCaseQuestion.includes('rows') || lowerCaseQuestion.includes('number of rows')) {
      return `${targetDataset.name} has ${targetDataset.rows?.toLocaleString() || 'an unknown number of'} rows.`;
    }

    if (lowerCaseQuestion.includes('columns') || lowerCaseQuestion.includes('number of columns') || lowerCaseQuestion.includes('fields')) {
       const columnCount = targetDataset.columns || (targetDataset.previewData?.columns.length ?? 'an unknown number of');
      return `${targetDataset.name} has ${columnCount} column${columnCount === 1 ? '' : 's'}.`;
    }

    if (lowerCaseQuestion.includes('column names') || lowerCaseQuestion.includes('fields in')) {
      if (targetDataset.previewData?.columns && targetDataset.previewData.columns.length > 0) {
        const columnNames = targetDataset.previewData.columns.join(', ');
        return `The columns in ${targetDataset.name} are: ${columnNames}.`;
      } else {
        return `I don't have the column names readily available for ${targetDataset.name}.`;
      }
    }

     if (lowerCaseQuestion.includes('file type')) {
        return `The file type for ${targetDataset.name} is ${targetDataset.fileType.toUpperCase()}.`;
     }

     if (lowerCaseQuestion.includes('file size')) {
         return `The file size for ${targetDataset.name} is ${targetDataset.fileSize || 'unknown'}.`;
     }

    // If a dataset is mentioned but the question is unclear
    return `You mentioned the ${targetDataset.name} dataset. What would you like to know about it? You can ask about its number of rows, columns, or column names.`;
  }

  // Basic example: Just list the available datasets if the user asks a general question about data/datasets
  if (lowerCaseQuestion.includes('dataset') || lowerCaseQuestion.includes('data')) {
    const datasetNames = datasets.map(d => d.name).join(', ');
    return `You currently have the following datasets loaded: ${datasetNames}. What specifically would you like to know about them?`;
  }


  // Default response if the question doesn't match any known patterns
  return "I can answer questions about your loaded datasets, but I need more specific information. What would you like to know? For example, you can ask "How many datasets do I have?" or "Tell me about the [dataset name] dataset."";
};
