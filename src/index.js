import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Administration from './pages/Administration';

// ... imports des composants

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
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/administration"
            element={authToken ? <Administration /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      </Router>
    </React.StrictMode>
  );
};

createRoot(rootElement).render(<App />);
