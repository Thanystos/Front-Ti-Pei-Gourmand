// Admin.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from '../../composants/AdminSideBar';
import AdminMainPanel from '../../composants/AdminMainPanel';

const AdminContainer = styled.div`
  display: flex;
`;

const Admin = () => {
  const [storedToken, setStoredToken] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('authToken');
    setStoredToken(token);

    // Décoder le token pour obtenir les informations
    const decodedToken = jwtDecode(token);
    const role = decodedToken.roles || '';

    setUserRole(role);
  }, []);

  const handleOptionClick = (option) => {
    // Cette fonction sera appelée depuis Sidebar avec l'option sélectionnée
    setSelectedOption(option);
  };

  const renderMainPanel = () => {
    // Fonction pour déterminer le contenu à afficher dans MainPanel en fonction de l'option sélectionnée
    // Vous pouvez utiliser un switch ou des conditions pour retourner le bon contenu en fonction de selectedOption
    // Par exemple :
    switch (selectedOption) {
      case 'Gestion des utilisateurs':
        return <div>Contenu pour Option 1</div>;
      case 'option2':
        return <div>Contenu pour Option 2</div>;
      default:
        return <div>Sélectionnez une option</div>;
    }
  };

  return (
    <AdminContainer>
      <AdminSidebar userRole={userRole} handleOptionClick={handleOptionClick} />
      <AdminMainPanel>{renderMainPanel()}</AdminMainPanel>
    </AdminContainer>
  );
};

export default Admin;
