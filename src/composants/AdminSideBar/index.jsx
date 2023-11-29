import React, { useState } from 'react';
import styled from 'styled-components';

// Styles pour le menu
const Sidebar = styled.div`
  width: 250px;
  background-color: #f3f3f3;
  height: 100vh;
`;

const MenuTitle = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
`;

const SubMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

// Composant Sidebar
const AdminSidebar = (props) => {
    const { userRole } = props; // Récupération de userRole depuis props
    const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  
    const toggleUsersMenu = () => {
      setUsersMenuOpen(!usersMenuOpen);
    };
  
    return (
      <Sidebar>
        {userRole.includes('ROLE_ADMIN') && ( /* Vérification si ROLE_ADMIN est dans le tableau des rôles */
          <>
            <MenuTitle onClick={toggleUsersMenu}>Gestion des utilisateurs</MenuTitle>
            {usersMenuOpen && (
              <SubMenu>
                <MenuItem>Liste des utilisateurs</MenuItem>
                {/* Autres options du menu conditionnées par les rôles */}
              </SubMenu>
            )}
          </>
        )}
        {/* Autres sections de menu conditionnées par les rôles */}
      </Sidebar>
    );
  };
  
  export default AdminSidebar;
