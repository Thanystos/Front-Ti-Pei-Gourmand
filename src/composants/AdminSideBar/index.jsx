// Sidebar.jsx
import React from 'react';
import styled from 'styled-components';

const AdminSidebarContainer = styled.div`
  width: 250px;
  background-color: #f3f3f3;
  height: 100vh;
  padding: 20px;
`;

const AdminSidebar = ( { userRole, handleOptionClick }) => {
  const onOptionClick = (option) => {
    // Lorsqu'un élément de la sidebar est cliqué, appelez la fonction handleOptionClick de Admin
    handleOptionClick(option);
  };

  return (
    <AdminSidebarContainer>
      {/* Créez les options du menu à gauche */}
      {userRole.includes('ROLE_ADMIN') && (
      <div onClick={() => onOptionClick('Gestion des utilisateurs')}>Gestion des utilisateurs</div>
      )}
      <div onClick={() => onOptionClick('option2')}>Option 2</div>
      {/* Ajoutez d'autres options ici */}
    </AdminSidebarContainer>
  );
};

export default AdminSidebar;