import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';

const rootElement = document.getElementById('root');

const App = () => {
  const [authToken, setAuthToken] = useState('');

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    // Stocker le token dans le localStorage après une connexion réussie
    localStorage.setItem('authToken', token);
  };

  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route
            path="/login"
            // On passe notre fonction au login qui s'en servira quand la connexion aura réussi
            element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/admin"
            element={authToken ? <Admin /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      </Router>
    </React.StrictMode>
  );
};

createRoot(rootElement).render(<App />);