import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './utils/style/bootstrap.min.css';
import './utils/style/templateStyle.css';
import './utils/style/font.css';
import { AuthProvider, CacheProvider } from './utils/context';

const rootElement = document.getElementById('root');

const App = () => {
  return (
    <Router>
      <CacheProvider>
        <AuthProvider>
          <Routes>
            <Route
              // la route /login monte le composant Login
              path="/login"
              element={<Login />}
            />
            <Route
              // La route /admin monte le composant Admin
              path="/admin"
              element={<Admin />}
            />
          </Routes>
        </AuthProvider>
      </CacheProvider>
    </Router>
  );
};

createRoot(rootElement).render(<App />);