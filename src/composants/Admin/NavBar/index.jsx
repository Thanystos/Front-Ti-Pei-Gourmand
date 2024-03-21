import { faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Dropdown, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../utils/hooks";

const NavBar = () => {

    const { setErrors, authUser } = useApi();

    // State permettant de gérer l'état de la liste déroulante
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Permet la redirection
    const navigate = useNavigate();

    // Méthode déclenchée au clic sur le bouton d'expansion et qui ajoute ou retire une classe affectant ainsi le style
    const handleSidebarToggle = () => {
        document.querySelectorAll('.sidebar, .content').forEach((el) => {
            el.classList.toggle('open');
        });
    }

    // Méthode déclenchée au clic sur la liste déroulante et inversant son état (ouvert / fermé)
    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }

    // Méthode déclenchée au clic sur l'élément du relatif à la déconnexion
    const handleDisconnect = () => {

        setErrors([]);

        // Vide le LocalStorage supprimant ainsi les informations sur le User connecté
        localStorage.clear();

        // Redirige vers la page Login
        navigate('/login');
    }

    return (
        <Navbar expand="lg" bg="secondary" variant="dark" className="navbar sticky-top px-4 py-0">
            <Nav.Link href="#" className="sidebar-toggler flex-shrink-0" onClick={handleSidebarToggle}>
                <FontAwesomeIcon icon={faBars} />
            </Nav.Link>
            <Nav className="navbar-nav align-items-center ms-auto">
                <Dropdown className="nav-item dropdown" onClick={handleDropdownClick}>
                    <Dropdown.Toggle className="nav-link dropdown-toggle" variant="transparent" id="dropdown-profile">
                        <img className="rounded-circle me-lg-2" src="img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
                        <span className="d-none d-lg-inline-flex">{authUser}</span>
                        <FontAwesomeIcon 
                            icon={faAngleDown}
                            size='sm'
                            className={`navIcon-after-dropdown ${isDropdownOpen ? 'rotate180' : ''}`}
                        />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={`dropdown-menu-end bg-secondary border-0 rounded-0 rounded-bottom m-0 ${isDropdownOpen ? 'show' : ''}`}>
                        <Dropdown.Item href="#">My Profile</Dropdown.Item>
                        <Dropdown.Item href="#">Settings</Dropdown.Item>
                        <Dropdown.Item onClick={handleDisconnect}>Log Out</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
        </Navbar>
    );
};

export default NavBar;