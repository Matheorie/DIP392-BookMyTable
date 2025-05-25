// client/src/pages/admin/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUsers, 
  faChair, 
  faUtensils,
  faCheckCircle,
  faTimesCircle,
  faUserClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    todayReservations: 0
  });
  const [todayReservations, setTodayReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Récupérer les statistiques et les réservations du jour
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Récupérer les réservations du jour
        const todayResponse = await api.get('/api/reservations/admin/today');
        
        if (todayResponse.data.success) {
          const reservations = todayResponse.data.reservations;
          setTodayReservations(reservations);
          
          // Calculer les statistiques
          const pendingCount = reservations.filter(r => r.status === 'pending').length;
          const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
          
          // Récupérer toutes les réservations pour le total
          const allResponse = await api.get('/api/reservations/admin');
          
          if (allResponse.data.success) {
            const totalCount = allResponse.data.reservations.length;
            
            setStats({
              totalReservations: totalCount,
              pendingReservations: pendingCount,
              confirmedReservations: confirmedCount,
              todayReservations: reservations.length
            });
          }
        } else {
          setError('Impossible de récupérer les données du tableau de bord.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données du tableau de bord:', err);
        setError('Une erreur est survenue lors du chargement des données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      case 'confirmed':
        return <Badge bg="success">Confirmée</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Annulée</Badge>;
      case 'completed':
        return <Badge bg="info">Terminée</Badge>;
      case 'no_show':
        return <Badge bg="dark">Absence</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tableau de bord</h2>
        <div className="welcome-message">
          <h5 className="mb-0">
            Bienvenue, {user?.username}
            <span className="ms-3 badge bg-secondary">{user?.role}</span>
          </h5>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="icon-container bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-primary" />
              </div>
              <h2 className="mb-0">{stats.totalReservations}</h2>
              <p className="text-muted">Réservations totales</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="icon-container bg-warning bg-opacity-10 p-3 rounded-circle mb-3">
                <FontAwesomeIcon icon={faUserClock} size="2x" className="text-warning" />
              </div>
              <h2 className="mb-0">{stats.pendingReservations}</h2>
              <p className="text-muted">En attente</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="icon-container bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success" />
              </div>
              <h2 className="mb-0">{stats.confirmedReservations}</h2>
              <p className="text-muted">Confirmées</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="icon-container bg-dark bg-opacity-10 p-3 rounded-circle mb-3">
                <FontAwesomeIcon icon={faUtensils} size="2x" className="text-info" />
              </div>
              <h2 className="mb-0">{stats.todayReservations}</h2>
              <p className="text-muted">Aujourd'hui</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Réservations d'aujourd'hui
                </h4>
                <Link to="/admin/reservations" className="btn btn-sm btn-light">
                  Voir toutes les réservations
                </Link>
              </div>
            </Card.Header>
            
            <Card.Body>
              {todayReservations.length === 0 ? (
                <Alert variant="info">
                  Aucune réservation pour aujourd'hui.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Client</th>
                        <th>Personnes</th>
                        <th>Table</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayReservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="fw-bold">{formatTime(reservation.time)}</td>
                          <td>
                            <div>{reservation.customer_name}</div>
                            <small className="text-muted">{reservation.customer_phone}</small>
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faUsers} className="me-1" />
                            {reservation.party_size}
                          </td>
                          <td>
                            {reservation.table_id ? (
                              <Badge bg="info">
                                <FontAwesomeIcon icon={faChair} className="me-1" />
                                Table {reservation.table_number}
                              </Badge>
                            ) : (
                              <Badge bg="secondary">Non assignée</Badge>
                            )}
                          </td>
                          <td>{getStatusBadge(reservation.status)}</td>
                          <td>
                            <Link 
                              to={`/admin/reservations/${reservation.id}`} 
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              Détails
                            </Link>
                            
                            {reservation.status === 'pending' && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                              >
                                Confirmer
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faChair} className="me-2" />
                Statut des tables
              </h4>
            </Card.Header>
            
            <Card.Body>
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <Button as={Link} to="/admin/tables" variant="outline-primary">
                  Voir toutes les tables
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Actions rapides
              </h4>
            </Card.Header>
            
            <Card.Body>
              <div className="d-grid gap-3">
                <Button as={Link} to="/reservation" variant="outline-primary">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Nouvelle réservation
                </Button>
                
                <Button as={Link} to="/admin/tables" variant="outline-primary">
                  <FontAwesomeIcon icon={faChair} className="me-2" />
                  Gérer les tables
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;