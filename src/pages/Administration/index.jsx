import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {jwtDecode} from 'jwt-decode'; // Correction de l'importation
import AdminSidebar from '../../composants/AdminSideBar';

const AdminContainer = styled.div`
  /* Styles pour la page d'administration */
`;

const AdminPage = () => {
  const [storedToken, setStoredToken] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('authToken');
    setStoredToken(token);

    // Décoder le token pour obtenir les informations
    const decodedToken = jwtDecode(token);
    const role = decodedToken.roles || ''; // Assurez-vous du nom correct du champ des rôles

      setUserRole(role);
  }, []);

  return (
    <AdminContainer>
      <h1>Page d'Administration</h1>
      {/* Autres éléments de votre page d'administration */}
      <AdminSidebar userRole={userRole} />
    </AdminContainer>
  );
};

export default AdminPage;
