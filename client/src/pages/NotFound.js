// client/src/pages/NotFound.js
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="error-page">
            <h1 className="display-1">404</h1>
            <h2 className="mb-4">Page non trouvée</h2>
            <p className="lead mb-5">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button as={Link} to="/" variant="primary">
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Retour à l'accueil
              </Button>
              <Button as={Link} to="/reservation" variant="outline-primary">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Réserver une table
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;