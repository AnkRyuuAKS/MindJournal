import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EntriesPage from './pages/EntriesPage';
import NewEntryPage from './pages/NewEntryPage';
import EditEntryPage from './pages/EditEntryPage';
import ViewEntryPage from './pages/ViewEntryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DSAPage from './pages/DSAPage';
import NewDSAPage from './pages/NewDSAPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <ProtectedRoute>
                <Layout>
                  <EntriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewEntryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewEntryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditEntryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa"
            element={
              <ProtectedRoute>
                <Layout>
                  <DSAPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewDSAPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}