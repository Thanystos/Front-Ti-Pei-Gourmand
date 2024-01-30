import { faAngleDown, faLaptop, faUserEdit, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { useAuth } from '../../../utils/hooks/index'

const AdminSidebar = ( { handleOptionClick }) => {

  const { authRoles } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }

  const onOptionClick = (option) => {
    // Lorsqu'un élément de la sidebar est cliqué, appelez la fonction handleOptionClick de Admin
    handleOptionClick(option);
  };

  return (
    <div className="sidebar pe-4 pb-3">
      <Navbar bg="secondary" variant="dark" expand={false}>
        <Navbar.Brand href="index.html" className="navbar-brand mx-4 mb-3">
          <h3 className="text-primary"><FontAwesomeIcon icon={faUserEdit} className="me-2"/>TP Gourmand</h3>
        </Navbar.Brand>
        <div className="d-flex align-items-center ms-4 mb-4">
          <div className="position-relative">
            <img className="rounded-circle" src="img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
            <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1"></div>
          </div>
          <div className="ms-3">
            <h6 className="mb-0">Jhon Doe</h6>
            <span>Admin</span>
          </div>
        </div>
        <Nav className="w-100">
          {authRoles.includes('ROLE_ADMIN') && (
            <Nav.Link href="#" className="nav-item nav-link active" onClick={() => onOptionClick('Gestion des utilisateurs')}><i className="me-2"><FontAwesomeIcon icon={faUserGear} /></i>Gestion employés</Nav.Link>
          )}
          <NavDropdown title={
            <span>
              <i className="me-2">
                <FontAwesomeIcon icon={faLaptop} />
              </i>
              Elements
              <FontAwesomeIcon 
                icon={faAngleDown}
                size='sm'
                className={`sideIcon-after-dropdown ${isDropdownOpen ? 'rotate180' : ''}`}
              />
            </span>} id="basic-nav-dropdown" menuVariant="transparent" className='position-relative' onClick={handleDropdownClick}>
            <NavDropdown.Item href="button.html">Buttons</NavDropdown.Item>
            <NavDropdown.Item href="typography.html">Typography</NavDropdown.Item>
            <NavDropdown.Item href="element.html">Other Elements</NavDropdown.Item>
          </NavDropdown>
          
        </Nav>
      </Navbar>
    </div>
  );
};

export default AdminSidebar;