// client/src/components/layout/Header.js
import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <Navbar expand="lg" className="navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img 
              src={logo} 
              alt="Restaurant Cazingue" 
              height="50" 
              className="d-inline-block align-top me-2" 
            />
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end>
                Accueil
              </Nav.Link>
              <Nav.Link as={NavLink} to="/menu">
                Menu
              </Nav.Link>
              <Nav.Link as={NavLink} to="/reservation">
                Réserver
              </Nav.Link>
              <Nav.Link as={NavLink} to="/contact">
                Contact
              </Nav.Link>
              
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle as={Nav.Link} id="dropdown-user" className="nav-link d-flex align-items-center">
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {user.username}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/admin/dashboard">
                      Tableau de bord
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin/reservations">
                      Réservations
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin/tables">
                      Tables
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin/settings">
                      Paramètres
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                      Déconnexion
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={NavLink} to="/admin/login">
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  Administration
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;