// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Vérifier si le token est expiré
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expiré
            logout();
            setLoading(false);
            return;
          }
          
          // Configurer le token pour les requêtes API
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Récupérer les informations de l'utilisateur
          const response = await api.get('/api/auth/me');
          setUser(response.data.user);
        } catch (err) {
          console.error('Erreur d\'authentification:', err);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { username, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Stocker le token dans le localStorage
        localStorage.setItem('token', token);
        
        // Configurer le token pour les requêtes API
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setToken(token);
        setUser(user);
        
        return { success: true };
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.message || 'Erreur de connexion');
      return { success: false, error: err.response?.data?.message || 'Erreur de connexion' };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    
    // Réinitialiser l'état
    setToken(null);
    setUser(null);
    
    // Supprimer le token des headers
    delete api.defaults.headers.common['Authorization'];
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user;

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };