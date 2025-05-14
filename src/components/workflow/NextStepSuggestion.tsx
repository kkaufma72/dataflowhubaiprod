import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

interface NextStepSuggestionProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ElementType; // Made icon optional
}

const NextStepSuggestion: React.FC<NextStepSuggestionProps> = ({
  title,
  description,
  href,
  icon: Icon
}) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {Icon && ( // Conditionally render the icon and its container
            <div className="flex items-center justify-center w-10 h-10 mr-4 bg-indigo-100 rounded-lg dark:bg-indigo-900 dark:bg-opacity-20">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div className={Icon ? "" : "ml-0"}> {/* Adjust layout if icon is not present */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <Link
          to={href}
          className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
        >
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
};

export default NextStepSuggestion;