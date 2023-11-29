import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const AdminContainer = styled.div`
  /* Styles pour la page d'administration */
`;

const AdminPage = () => {
  const [storedToken, setStoredToken] = useState('');

  useEffect(() => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setStoredToken(token);
    }
  }, []);

  return (
    <AdminContainer>
      <h1>Page d'Administration</h1>
      <p>Token d'authentification stocké : {storedToken}</p>
      {/* Autres éléments de votre page d'administration */}
    </AdminContainer>
  );
};

export default AdminPage;
