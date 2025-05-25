// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ReservationForm from './pages/ReservationForm';
import ReservationConfirmation from './pages/ReservationConfirmation';
import ManageReservation from './pages/ManageReservation';
import Login from './pages/admin/Login';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReservations from './pages/admin/Reservations';
import AdminTables from './pages/admin/Tables';
import AdminSettings from './pages/admin/Settings';
import NotFound from './pages/NotFound';
// Import du MenuPage
import MenuPage from './pages/MenuPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/App.css';
import './assets/css/timeSlots.css';
import './assets/css/color-fixes.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/reservation" element={<ReservationForm />} />
              <Route path="/confirmation/:code" element={<ReservationConfirmation />} />
              <Route path="/reservations/manage/:code" element={<ManageReservation />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/contact" element={<ContactPage />} />
            
              
              {/* Routes d'administration */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/reservations" element={
                <PrivateRoute>
                  <AdminReservations />
                </PrivateRoute>
              } />
              <Route path="/admin/tables" element={
                <PrivateRoute>
                  <AdminTables />
                </PrivateRoute>
              } />
              <Route path="/admin/settings" element={
                <PrivateRoute>
                  <AdminSettings />
                </PrivateRoute>
              } />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;