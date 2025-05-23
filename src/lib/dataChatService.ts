import { Dataset } from '../types';

// Helper function to find a dataset by name (case-insensitive)
const findDatasetByName = (name: string, datasets: Dataset[]): Dataset | undefined => {
  return datasets.find(dataset => dataset.name.toLowerCase() === name.toLowerCase());
};

// This service will contain logic to process user questions
// and query the loaded datasets to generate answers.

export const handleDataChatQuery = (question: string, datasets: Dataset[]): string => {
  const lowerCaseQuestion = question.toLowerCase().trim();

  if (!datasets || datasets.length === 0) {
    return 'No datasets are currently loaded.';
  }

  if (lowerCaseQuestion.includes('how many datasets') || lowerCaseQuestion.includes('number of datasets')) {
    return `You have ${datasets.length} dataset${datasets.length === 1 ? '' : 's'} loaded.`;
  }

  if (lowerCaseQuestion.includes('list datasets') || lowerCaseQuestion.includes('show datasets') || (lowerCaseQuestion.includes('what datasets') && lowerCaseQuestion.includes('loaded'))) {
    const datasetNames = datasets.map(d => d.name).join(', ');
    return `Your loaded datasets are: ${datasetNames}.`;
  }

  let targetDataset: Dataset | undefined = undefined;
  
  const matchingDatasetsByName = datasets.filter(ds => lowerCaseQuestion.includes(ds.name.toLowerCase()));

  if (matchingDatasetsByName.length > 1) {
    return `I found mentions of multiple datasets: ${matchingDatasetsByName.map(d => d.name).join(', ')}. Could you please focus on one or clarify your question?`;
  }
  if (matchingDatasetsByName.length === 1) {
    targetDataset = matchingDatasetsByName[0];
  }

  if (!targetDataset) {
    const parts = lowerCaseQuestion.split(' ');
    for (let i = 0; i < parts.length; i++) {
        let potentialNamePhrase = '';
        for (let j = i; j < parts.length; j++) {
            potentialNamePhrase = parts.slice(i, j + 1).join(' ');
            const matchedDs = datasets.find(ds => ds.name.toLowerCase() === potentialNamePhrase);
            if (matchedDs) {
                targetDataset = matchedDs;
                break; 
            }
        }
        if (targetDataset) break;
    }
  }

  if (targetDataset) {
    const datasetDisplayName = targetDataset.name;

    if (lowerCaseQuestion.includes('rows') || lowerCaseQuestion.includes('number of rows')) {
      return `${datasetDisplayName} has ${targetDataset.metadata?.rowCount?.toLocaleString() || 'an unknown number of'} rows.`;
    }

    if (lowerCaseQuestion.includes('columns') || lowerCaseQuestion.includes('number of columns') || lowerCaseQuestion.includes('fields')) {
      const columnCount = targetDataset.metadata?.columns?.length ?? 'an unknown number of';
      return `${datasetDisplayName} has ${columnCount} column${typeof columnCount === 'number' && columnCount === 1 ? '' : 's'}.`;
    }

    if (lowerCaseQuestion.includes('column names') || lowerCaseQuestion.includes('what are the columns') || lowerCaseQuestion.includes('list columns')) {
      if (targetDataset.metadata?.columns && targetDataset.metadata.columns.length > 0) {
        const columnNames = targetDataset.metadata.columns.join(', ');
        return `${datasetDisplayName} has the following columns: ${columnNames}.`;
      } else {
        return `I don't have the column names readily available for ${datasetDisplayName}.`;
      }
    }

    if (lowerCaseQuestion.includes('file type') || lowerCaseQuestion.includes('type of file') || lowerCaseQuestion.includes('format')) {
      return `${datasetDisplayName} is of type ${targetDataset.metadata?.type || 'unknown'}.`;
    }

    if (lowerCaseQuestion.includes('size of') || lowerCaseQuestion.includes('file size')) {
      return `${datasetDisplayName} is ${targetDataset.metadata?.size?.toLocaleString() || 'unknown'} bytes.`;
    }

    return `Okay, you mentioned ${datasetDisplayName}. What would you like to know about it? You can ask about its rows, columns, type, size, or column names.`;
  }
  
  if (lowerCaseQuestion.includes('dataset') || lowerCaseQuestion.includes('data')) {
    return 'You can load various types of datasets like CSV, JSON, etc. How can I help you with your datasets?';
  }

  return 'I am designed to answer questions about your datasets. How can I help with that?';
};