import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import BusDetails from './pages/BusDetails';
import Drivers from './pages/Drivers';
import Conductors from './pages/Conductors';
import Trips from './pages/Trips';
import Dailies from './pages/Dailies';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Expenses from './pages/Expenses';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="buses" element={<Buses />} />
        <Route path="buses/:id" element={<BusDetails />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="conductors" element={<Conductors />} />
        <Route path="trips" element={<Trips />} />
        <Route path="dailies" element={<Dailies />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
