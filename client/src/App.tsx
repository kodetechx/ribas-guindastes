import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import OperatorList from './pages/OperatorList';
import OperatorDetail from './pages/OperatorDetail';
import ChecklistExecution from './pages/ChecklistExecution';
import MyDocuments from './pages/MyDocuments';
import ServicesList from './pages/ServicesList';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/equipamentos" element={
            <ProtectedRoute>
              <Layout>
                <EquipmentList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/equipamentos/:id" element={
            <ProtectedRoute>
              <Layout>
                <EquipmentDetail />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/checklist/:id" element={
            <ProtectedRoute>
              <Layout>
                <ChecklistExecution />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/operadores" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout>
                <OperatorList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/operadores/:id" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout>
                <OperatorDetail />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/servicos" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout>
                <ServicesList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/meus-documentos" element={
            <ProtectedRoute roles={['operator']}>
              <Layout>
                <MyDocuments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
