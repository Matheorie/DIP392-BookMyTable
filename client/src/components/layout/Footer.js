// client/src/components/layout/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faClock,
  faUtensils,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Restaurant Cazingue</h5>
            <p>Bienvenue dans notre restaurant familial où la cuisine française traditionnelle rencontre la modernité.</p>
            <div className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              <span>67 Rue Chaptal, 92300 Levallois-Perret</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faPhone} className="me-2" />
              <span>09 73 88 03 94</span>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              <span>cazingue@gmail.com</span>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Horaires d'ouverture</h5>
            <ul className="list-unstyled">
              <li className="d-flex align-items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>Lundi - Mercredi</span>
                <span className="ms-auto">12h00 - 15h00</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>Jeudi</span>
                <span className="ms-auto">12h00 - 15h00 | 19h00 - 00h30</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>Vendredi</span>
                <span className="ms-auto">12h00 - 15h00</span>
              </li>
              <li className="d-flex align-items-center">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>Samedi - Dimanche</span>
                <span className="ms-auto">Fermé</span>
              </li>
            </ul>
            <div className="mt-3">
              <Link to="/reservation" className="btn btn-outline-light">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Réserver une table
              </Link>
            </div>
          </Col>
          
          <Col md={4}>
            <h5 className="mb-3">Liens rapides</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">Accueil</Link>
              </li>
              <li className="mb-2">
                <Link to="/menu" className="text-white text-decoration-none">Menu</Link>
              </li>
              <li className="mb-2">
                <Link to="/reservation" className="text-white text-decoration-none">Réservation</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none">Contact</Link>
              </li>
              <li className="mb-2">
                <Link to="/admin/login" className="text-white text-decoration-none">Administration</Link>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4 bg-light" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Restaurant Cazingue - Tous droits réservés
            </p>
            <p className="small mt-2">
              <FontAwesomeIcon icon={faUtensils} className="me-1" />
              Système de réservation développé par l'équipe DIP392-BookMyTable
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;