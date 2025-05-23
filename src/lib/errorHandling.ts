import toast from 'react-hot-toast';

export interface ApiError {
  status?: number;
  message: string;
  details?: any;
}

const simplifyErrorMessage = (message: string): string => {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim().toLowerCase();
  const timeoutKeyword = 'timeout';

  // Attempting with indexOf as a last resort for the timeout check
  if (normalizedMessage.includes('failed to fetch')) {
    return 'Connection error. Please check your internet connection.';
  }
  if (normalizedMessage.includes('networkerror') || normalizedMessage.includes('network error')) {
    return 'Network error. Please try again later.';
  }
  // Using indexOf instead of includes for the timeout check
  if (normalizedMessage.indexOf(timeoutKeyword) !== -1) {
    return 'Request timed out. Please try again.';
  }
  if (message.length > 100) {
    return message.substring(0, 100) + '...';
  }
  return message;
};

export const handleApiError = (error: unknown, fallbackMessage = 'An unexpected error occurred'): ApiError => {
  console.error('API Error:', error);
  
  let processedMessage = fallbackMessage;
  let processedStatus: number | undefined = undefined;
  let processedDetails: any = undefined;
  
  if (error instanceof Error) {
    processedMessage = simplifyErrorMessage(error.message);
    if (typeof error === 'object' && error !== null) {
      if ('status' in error && typeof (error as any).status === 'number') {
        processedStatus = (error as any).status;
      }
      if ('details' in error) {
        processedDetails = (error as any).details;
      }
    }
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      processedMessage = simplifyErrorMessage(error.message);
    } 
    if ('status' in error && typeof error.status === 'number') {
      processedStatus = error.status;
    }
    if ('details' in error) {
      processedDetails = error.details;
    }
  } else if (typeof error === 'string') {
    processedMessage = simplifyErrorMessage(error);
  } 
  
  toast.error(processedMessage);
  
  return {
    status: processedStatus,
    message: processedMessage,
    details: processedDetails
  };
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    return (
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('network request failed') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('the internet connection appears to be offline')
    );
  }
  return false;
};

export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
    return error.status === 401 || error.status === 403;
  }
  return false;
};

export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};