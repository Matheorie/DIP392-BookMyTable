// client/src/pages/ReservationConfirmation.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faCalendarAlt, 
  faUser, 
  faUsers, 
  faEnvelope, 
  faPhone, 
  faClock, 
  faEdit, 
  faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';

const ReservationConfirmation = () => {
  const { code } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupérer les détails de la réservation
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/reservations/code/${code}`);
        
        if (response.data.success) {
          setReservation(response.data.reservation);
        } else {
          setError('Impossible de récupérer les détails de la réservation.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la réservation:', err);
        setError('Réservation non trouvée. Veuillez vérifier votre code de confirmation.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchReservation();
    }
  }, [code]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  };

  // Formater l'heure pour l'affichage
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Déterminer le statut de la réservation pour l'affichage
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'En attente de confirmation',
          variant: 'warning',
          icon: faExclamationCircle
        };
      case 'confirmed':
        return {
          text: 'Confirmée',
          variant: 'success',
          icon: faCheckCircle
        };
      case 'cancelled':
        return {
          text: 'Annulée',
          variant: 'danger',
          icon: faExclamationCircle
        };
      default:
        return {
          text: status,
          variant: 'secondary',
          icon: faExclamationCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>
                <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                Erreur
              </Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Link to="/reservation" className="btn btn-primary">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Nouvelle réservation
                </Link>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <Alert.Heading>
                <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                Réservation non trouvée
              </Alert.Heading>
              <p>Aucune réservation correspondant à ce code n'a été trouvée.</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Link to="/reservation" className="btn btn-primary">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Nouvelle réservation
                </Link>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Obtenir les informations de statut
  const statusInfo = getStatusDisplay(reservation.status);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className={`bg-${statusInfo.variant} text-white text-center py-3`}>
              <h2 className="mb-0">
                <FontAwesomeIcon icon={statusInfo.icon} className="me-2" />
                {reservation.status === 'pending' ? 'Réservation reçue' : 'Réservation ' + statusInfo.text.toLowerCase()}
              </h2>
            </Card.Header>
            
            <Card.Body className="p-4">
              <Alert variant={statusInfo.variant} className="mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={statusInfo.icon} size="lg" className="me-3" />
                  <div>
                    <strong>{statusInfo.text}</strong>
                    {reservation.status === 'pending' && (
                      <p className="mb-0 small">
                        Nous examinerons votre demande et vous enverrons un email de confirmation dans les plus brefs délais.
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
              
              <div className="mb-4 text-center">
                <h5>Code de confirmation</h5>
                <div className="confirmation-code p-2 bg-light rounded border d-inline-block px-3 py-2 fw-bold">
                  {reservation.confirmation_code}
                </div>
                <p className="small text-muted mt-2">
                  Conservez ce code pour gérer votre réservation
                </p>
              </div>
              
              <h5 className="border-bottom pb-2 mb-3">Détails de la réservation</h5>
              
              <Row className="mb-4">
                <Col sm={6} className="mb-3 mb-sm-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faCalendarAlt} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Date</h6>
                      <p className="mb-0">{formatDate(reservation.date)}</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faClock} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Heure</h6>
                      <p className="mb-0">{formatTime(reservation.time)}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col sm={6} className="mb-3 mb-sm-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faUsers} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Nombre de personnes</h6>
                      <p className="mb-0">{reservation.party_size} {reservation.party_size > 1 ? 'personnes' : 'personne'}</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  {reservation.table_id && reservation.table_number && (
                    <div className="d-flex">
                      <div className="me-3">
                        <FontAwesomeIcon icon={faUser} size="lg" className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-1">Table</h6>
                        <p className="mb-0">N° {reservation.table_number}</p>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
              
              <h5 className="border-bottom pb-2 mb-3">Vos coordonnées</h5>
              
              <Row className="mb-4">
                <Col sm={6} className="mb-3 mb-sm-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faUser} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Nom</h6>
                      <p className="mb-0">{reservation.customer_name}</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faPhone} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Téléphone</h6>
                      <p className="mb-0">{reservation.customer_phone}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col>
                  <div className="d-flex">
                    <div className="me-3">
                      <FontAwesomeIcon icon={faEnvelope} size="lg" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Email</h6>
                      <p className="mb-0">{reservation.customer_email}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {reservation.comments && (
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Commentaires</h5>
                  <p className="mb-0">{reservation.comments}</p>
                </div>
              )}
              
              <div className="d-flex justify-content-center mt-4">
                <Link 
                  to={`/reservations/manage/${reservation.confirmation_code}`} 
                  className="btn btn-primary me-3"
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier la réservation
                </Link>
                
                <Link to="/" className="btn btn-outline-secondary">
                  Retour à l'accueil
                </Link>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-muted small">
              <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
              Une confirmation a été envoyée à votre adresse email {reservation.customer_email}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ReservationConfirmation;