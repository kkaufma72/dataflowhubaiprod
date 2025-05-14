import React, { useState } from 'react';
import Card from '../components/common/Card';

interface MultiStepProgressProps {
  steps: string[];
  currentStepName: string;
  overallProgress: number;
  currentStepProgress: number;
}

const MultiStepProgress: React.FC<MultiStepProgressProps> = ({ steps, currentStepName, overallProgress, currentStepProgress }) => {
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }}></div>
      </div>
      <ul className="steps-list">
        {steps.map((step, index) => (
          <li key={index} className={step === currentStepName ? 'current-step' : ''}>
            {step}
          </li>
        ))}
      </ul>
      <p>Current Step Progress: {currentStepProgress}%</p>
    </div>
  );
};

const ModelTrainingPage: React.FC = () => {
  const [trainingProgress, setTrainingProgress] = useState({
    currentStep: 'Data Preprocessing',
    steps: ['Data Preprocessing', 'Feature Selection', 'Model Search', 'Hyperparameter Tuning', 'Final Evaluation'],
    progress: 25, // Overall progress
    stepProgress: 60, // Progress of current step
  });

  // ...logic to update trainingProgress...

  return (
    <div>
      {/* ... other UI elements ... */}
      {isTraining && (
        <Card>
          <h2 className="text-lg font-medium mb-4">Model Training In Progress</h2>
          <MultiStepProgress
            steps={trainingProgress.steps}
            currentStepName={trainingProgress.currentStep}
            overallProgress={trainingProgress.progress}
            currentStepProgress={trainingProgress.stepProgress}
          />
          <p className="mt-4 text-sm text-gray-600">Status: {trainingProgress.currentStep} ({trainingProgress.stepProgress}%)</p>
        </Card>
      )}
      {/* ... other UI elements ... */}
    </div>
  );
};

export default ModelTrainingPage;
