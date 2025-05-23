import React, { lazy, Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';
import { MLProvider } from './context/MLContext.tsx';
import { AuthProvider } from './components/auth/AuthProvider.tsx';
import { UserProvider } from './context/UserContext.tsx';
import PrivateRoute from './components/auth/PrivateRoute.tsx';
import AppLayout from './components/layout/AppLayout.tsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';
import LandingLayout from './components/layout/LandingLayout.tsx';
import { NotificationProvider } from './components/common/NotificationSystem.tsx';
import { TourProvider } from './components/common/TourProvider.tsx';

// Import Dashboard directly
import Dashboard from './pages/Dashboard.tsx';

// Lazy-loaded page components (Dashboard is no longer lazy)
const Documentation = lazy(() => import('./pages/Documentation.tsx'));
// const Dashboard = lazy(() => import('./pages/Dashboard.tsx')); // Commented out
const DataManagement = lazy(() => import('./pages/DataManagement.tsx'));
const FeatureEngineering = lazy(() => import('./pages/FeatureEngineering.tsx'));
const ModelTraining = lazy(() => import('./pages/ModelTraining.tsx'));
const ModelEvaluation = lazy(() => import('./pages/ModelEvaluation.tsx'));
const Deployment = lazy(() => import('./pages/Deployment.tsx'));
const ModelMonitoring = lazy(() => import('./pages/ModelMonitoring.tsx'));
const Visualizations = lazy(() => import('./pages/Visualizations.tsx'));
const PipelineBuilder = lazy(() => import('./pages/PipelineBuilder.tsx'));
const DataPipelineDashboard = lazy(() => import('./pages/DataPipelineDashboard.tsx'));
const SignIn = lazy(() => import('./pages/SignIn.tsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const AccountSettings = lazy(() => import('./pages/AccountSettings.tsx'));
const PasswordReset = lazy(() => import('./pages/PasswordReset.tsx'));
const DataCenterInfrastructureReport = lazy(() => import('./pages/DataCenterInfrastructureReport.tsx'));
const APIManagement = lazy(() => import('./components/api/APIManagement.tsx'));
const APIReference = lazy(() => import('./pages/APIReference.tsx'));
const AsyncWorkloadDashboard = lazy(() => import('./pages/AsyncWorkloadDashboard.tsx'));
const Features = lazy(() => import('./components/Features.tsx'));
const UserGuideDetail = lazy(() => import('./pages/UserGuideDetail.tsx'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation.tsx'));

// Global error handler for uncaught errors
const GlobalErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-900">Something went wrong</h2>
        <div className="p-3 mb-4 overflow-auto text-sm bg-red-50 rounded-md text-red-600 max-h-32">
          {error.message}
        </div>
        <p className="mb-4 text-sm text-gray-600">
          We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </p>
        <div className="flex justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Log errors to console in development
const logError = (error: Error, info: { componentStack: string }) => {
  console.error('Uncaught error:', error);
  console.error('Component stack:', info.componentStack);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onError={logError}>
      <Router>
        <AuthProvider>
          <UserProvider>
            <MLProvider>
              <NotificationProvider>
                <TourProvider>
                  <DndProvider backend={HTML5Backend}>
                    <Toaster 
                      position="top-right" 
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#FFFFFF',
                          color: '#1F2937',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          borderRadius: '0.375rem',
                          padding: '0.75rem 1rem',
                        },
                        success: {
                          iconTheme: {
                            primary: '#10B981',
                            secondary: '#FFFFFF',
                          },
                          duration: 3000,
                        },
                        error: {
                          iconTheme: {
                            primary: '#EF4444',
                            secondary: '#FFFFFF',
                          },
                          duration: 4000,
                        },
                      }}
                    />
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        {/* Landing page routes */}
                        <Route path="/" element={<LandingLayout />}>
                          <Route index element={<LandingPage />} />
                          <Route path="features" element={<Features />} />
                          <Route path="documentation" element={<Documentation />} />
                          <Route path="api-reference" element={<APIReference />} />
                        </Route>
                        
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/password-reset" element={<PasswordReset />} />
                        
                        {/* Authenticated routes with layout */}
                        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                          <Route index element={<Dashboard />} /> 
                          <Route path="documentation" element={<Documentation />} />
                          <Route path="data" element={<DataManagement />} />
                          <Route path="feature-engineering" element={<FeatureEngineering />} />
                          <Route path="train" element={<ModelTraining />} />
                          <Route path="evaluate" element={<ModelEvaluation />} />
                          <Route path="deploy" element={<Deployment />} />
                          <Route path="monitoring" element={<ModelMonitoring />} />
                          <Route path="visualizations" element={<Visualizations />} />
                          <Route path="pipeline" element={<PipelineBuilder />} />
                          <Route path="profile" element={<UserProfile />} />
                          <Route path="settings" element={<AccountSettings />} />
                          <Route path="data-center-report" element={<DataCenterInfrastructureReport />} />
                          <Route path="api-management" element={<APIManagement />} />
                          <Route path="documentation/guides/:guideId" element={<UserGuideDetail />} />
                          <Route path="documentation/api" element={<APIDocumentation />} />
                        </Route>
                        
                        <Route path="/async-workloads" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                          <Route index element={<AsyncWorkloadDashboard />} />
                        </Route>
                        
                        <Route path="/pipeline/dashboard" element={<PrivateRoute><DataPipelineDashboard /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </DndProvider>
                </TourProvider>
              </NotificationProvider>
            </MLProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);