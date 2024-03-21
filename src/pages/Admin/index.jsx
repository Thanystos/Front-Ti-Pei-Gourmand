import React, { useState } from 'react';
import Sidebar from '../../composants/Admin/SideBar';
import MainPanel from '../../composants/Admin/MainPanel'
import UserTable from '../../composants/UsersManagement/UserTable';
import RoleTable from '../../composants/RolesManagement/RoleTable';
import StockTable from '../../composants/StocksManagement/StockTable';
import { Container } from 'react-bootstrap';

const Admin = () => {

  // State récupérant le texte de l'option sélectionnée dans la sidebar
  const [selectedOption, setSelectedOption] = useState('');

  // Méthode déclenchée au clic sur une des options du menu de la sidebar
  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  // Méthode permettant de rendre un composant en fonction de l'option cliquée de la sidebar
  const renderMainPanel = () => {
    switch (selectedOption) {
      case 'Gestion des utilisateurs':
        return <UserTable />;
      case 'Gestion des roles':
        return <RoleTable />;
      case 'Gestion des stocks':
        return <StockTable />;
      default:
        return <div>Sélectionnez une option</div>;
    }
  };

  return (
    <Container fluid className='position-relative d-flex p-0'>
      <Sidebar handleOptionClick={handleOptionClick} />
      <MainPanel>{renderMainPanel()}</MainPanel>
    </Container>
  );
};

export default Admin;