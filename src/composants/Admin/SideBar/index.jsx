import { propTypes } from 'prop-types';
import {
  faAngleDown, faBox, faKey, faLaptop, faUserEdit, faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { React, useState } from 'react';
import { Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { useApi } from '../../../utils/hooks/index';

function Sidebar({ handleOptionClick }) {
  // State partagée par mon provider
  const { authPermissions, authUser, authRoles } = useApi();

  // State permettant de gérer l'état de la liste déroulante
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [activeOption, setActiveOption] = useState('');

  // Méthode déclenchée au clic sur la liste déroulante et inversant son état (ouvert)
  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Méthode déclenchée au clic sur un des éléments du menu et rendant le composant associé
  const onOptionClick = (option) => {
    handleOptionClick(option);
    setActiveOption(option);
  };

  console.log('montage du composant AdminSideBar');
  return (
    <div className="sidebar pe-4 pb-3">
      <Navbar bg="secondary" variant="dark" expand={false}>
        <Navbar.Brand href="index.html" className="navbar-brand mx-4 mb-3">
          <h3 className="text-primary">
            <FontAwesomeIcon icon={faUserEdit} className="me-2" />
            TP Gourmand
          </h3>
        </Navbar.Brand>
        <div className="d-flex align-items-center ms-4 mb-4">
          <div className="position-relative">
            <img className="rounded-circle" src="img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
            <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1" />
          </div>
          <div className="ms-3">
            <h6 className="mb-0">{authUser}</h6>
            <span>{authRoles}</span>
          </div>
        </div>
        <Nav className="w-100">
          {authPermissions.includes('Accès à la liste des employés') && (
            <Nav.Link className={`nav-item nav-link ${activeOption === 'Gestion des utilisateurs' ? 'active' : ''}`} onClick={() => onOptionClick('Gestion des utilisateurs')}>
              <i className="me-2">
                <FontAwesomeIcon icon={faUserGear} />
              </i>
              Gestion employés
            </Nav.Link>
          )}
          {authPermissions.includes('Accès à la liste des rôles et permissions associées') && (
            <Nav.Link className={`nav-item nav-link ${activeOption === 'Gestion des roles' ? 'active' : ''}`} onClick={() => onOptionClick('Gestion des roles')}>
              <i className="me-2">
                <FontAwesomeIcon icon={faKey} />
              </i>
              Gestion roles
            </Nav.Link>
          )}
          {authPermissions.includes('Accès à la liste des ingrédients') && (
            <Nav.Link className={`nav-item nav-link ${activeOption === 'Gestion des stocks' ? 'active' : ''}`} onClick={() => onOptionClick('Gestion des stocks')}>
              <i className="me-2">
                <FontAwesomeIcon icon={faBox} />
              </i>
              Gestion stocks
            </Nav.Link>
          )}
          <NavDropdown
            title={(
              <span>
                <i className="me-2">
                  <FontAwesomeIcon icon={faLaptop} />
                </i>
                Elements
                <FontAwesomeIcon
                  icon={faAngleDown}
                  size="sm"
                  className={`sideIcon-after-dropdown ${isDropdownOpen ? 'rotate180' : ''}`}
                />
              </span>
            )}
            id="basic-nav-dropdown"
            menuVariant="transparent"
            className="position-relative"
            onClick={handleDropdownClick}
          >
            <NavDropdown.Item href="button.html">Buttons</NavDropdown.Item>
            <NavDropdown.Item href="typography.html">Typography</NavDropdown.Item>
            <NavDropdown.Item href="element.html">Other Elements</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
    </div>
  );
}

Sidebar.propTypes = {
  handleOptionClick: propTypes.func.isRequired,
};

export default Sidebar;
