import React, { useState } from 'react';
import AdminSidebar from '../../composants/AdminSideBar';
import AdminMainPanel from '../../composants/AdminMainPanel';
import AdminUserTable from '../../composants/AdminUserTable';
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
        return <AdminUserTable />;
      case 'option2':
        return <div>Contenu pour Option 2</div>;
      default:
        return <div>Sélectionnez une option</div>;
    }
  };

  return (
    <Container fluid className='position-relative d-flex p-0'>
      <AdminSidebar handleOptionClick={handleOptionClick} />
      <AdminMainPanel>{renderMainPanel()}</AdminMainPanel>
    </Container>
  );
};

export default Admin;