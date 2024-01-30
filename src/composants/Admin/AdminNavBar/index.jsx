import { faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Dropdown, Nav, Navbar } from "react-bootstrap";

const AdminNavBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSidebarToggle = () => {
        document.querySelectorAll('.sidebar, .content').forEach((el) => {
            el.classList.toggle('open');
        });
    }

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }
    return(
        <Navbar expand="lg" bg="secondary" variant="dark" className="navbar sticky-top px-4 py-0">
            <a href="#" className="sidebar-toggler flex-shrink-0" onClick={handleSidebarToggle}>
                <FontAwesomeIcon icon={faBars} />
            </a>
            <Nav className="navbar-nav align-items-center ms-auto">
                <Dropdown className="nav-item dropdown" onClick={handleDropdownClick}>
                    <Dropdown.Toggle className="nav-link dropdown-toggle" variant="transparent" id="dropdown-profile">
                        <img className="rounded-circle me-lg-2" src="img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
                        <span className="d-none d-lg-inline-flex">John Doe</span>
                        <FontAwesomeIcon 
                            icon={faAngleDown}
                            size='sm'
                            className={`navIcon-after-dropdown ${isDropdownOpen ? 'rotate180' : ''}`}
                        />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={`dropdown-menu-end bg-secondary border-0 rounded-0 rounded-bottom m-0 ${isDropdownOpen ? 'show' : ''}`}>
                        <Dropdown.Item href="#">My Profile</Dropdown.Item>
                        <Dropdown.Item href="#">Settings</Dropdown.Item>
                        <Dropdown.Item href="#">Log Out</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
        </Navbar>
    );
};

export default AdminNavBar;