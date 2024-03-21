import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './utils/style/bootstrap.min.css';
import './utils/style/templateStyle.css';
import './utils/style/font.css';
import { ApiProvider, ModalManagementProvider } from './utils/context';

const rootElement = document.getElementById('root');

function App() {
  return (
    <Router>
      <ApiProvider>
        <ModalManagementProvider>
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
        </ModalManagementProvider>
      </ApiProvider>
    </Router>
  );
}

createRoot(rootElement).render(<App />);
