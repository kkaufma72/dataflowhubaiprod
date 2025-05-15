import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { useMLContext } from '../../context/MLContext';
import Button from '../common/Button';
import Card from '../common/Card';
import ErrorBoundary from '../common/ErrorBoundary';
// import { handleApiError } from '../../lib/errorHandling'; // Not needed for frontend chat
// import { useDebounce } from '../../lib/performance'; // Not strictly needed for this basic implementation
import { answerQuestionAboutDatasets } from '../../lib/dataChatService'; // Import the new service

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatInterface: React.FC = () => {
  const { datasets } = useMLContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Remove Supabase environment variable check as backend is not used for dataset chat
  // useEffect(() => {
  //   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  //   const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  //
  //   if (!supabaseUrl || !supabaseKey) {
  //     setError('Missing Supabase configuration. Please check your environment variables.');
  //     return;
  //   }
  // }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed debouncedScrollToBottom as it's not strictly necessary for this basic version
  // const debouncedScrollToBottom = useDebounce(scrollToBottom, 100);
  // useEffect(() => {
  //   window.addEventListener('resize', debouncedScrollToBottom);
  //   return () => {
  //     window.removeEventListener('resize', debouncedScrollToBottom);
  //   };
  // }, [debouncedScrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Remove Supabase environment variable check
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // if (!supabaseUrl || !supabaseKey) {
    //   setError('Missing Supabase configuration. Please check your environment variables.');
    //   return;
    // }

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; // Capture current input before clearing
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // **Replaced backend fetch with frontend service call**
      const assistantResponse = answerQuestionAboutDatasets(currentInput, datasets);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);

    } catch (error) {
      console.error('Chat error:', error);
      // Use a simpler error handling for frontend logic
      setError('An error occurred while processing your request.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified initial error state rendering
  // if (error && messages.length === 0) {
  //   return (
  //     <Card className="flex flex-col h-[600px] items-center justify-center">
  //       <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
  //       <p className="text-red-600 text-center max-w-md">{error}</p>
  //     </Card>
  //   );
  // }

  return (
    <ErrorBoundary>
      <Card className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          {/* Display error message within the chat history if it occurs after messages have been sent */}
          {error && messages.length > 0 && (
            <div className="flex justify-center">
              <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your datasets..."
              className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              aria-label="Chat message"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              aria-label="Send message"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </ErrorBoundary>
  );
};

export default ChatInterface;