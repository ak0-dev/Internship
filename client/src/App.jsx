import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleDashboardPage from './pages/RoleDashboardPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobsPage from './pages/JobsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import JobInterviewsPage from './pages/JobInterviewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                <EditJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                <ApplicationDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/applications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                <JobApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <InterviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/interviews"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                <JobInterviewsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
