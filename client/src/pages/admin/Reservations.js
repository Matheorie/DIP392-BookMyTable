// client/src/pages/admin/Reservations.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faSearch, 
  faFilter, 
  faSyncAlt,
  faUsers,
  faChair,
  faEye,
  faEdit,
  faTrash,
  faCheckCircle,
  faExclamationTriangle,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';

// Enregistrer la locale française pour le calendrier
registerLocale('fr', fr);

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    date: null,
    status: '',
    customer_name: '',
    customer_email: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const reservationsPerPage = 10;

  // Récupérer les réservations
  useEffect(() => {
    fetchReservations();
  }, [currentPage, filters]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Préparer les paramètres de filtre
      const params = {};
      
      if (filters.date) {
        params.date = filters.date.toISOString().split('T')[0];
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.customer_name) {
        params.customer_name = filters.customer_name;
      }
      
      if (filters.customer_email) {
        params.customer_email = filters.customer_email;
      }
      
      const response = await api.get('/api/reservations/admin', { params });
      
      if (response.data.success) {
        const allReservations = response.data.reservations;
        
        // Pagination
        setTotalPages(Math.ceil(allReservations.length / reservationsPerPage));
        
        // Obtenir les réservations pour la page actuelle
        const startIndex = (currentPage - 1) * reservationsPerPage;
        const paginatedReservations = allReservations.slice(startIndex, startIndex + reservationsPerPage);
        
        setReservations(paginatedReservations);
      } else {
        setError('Impossible de récupérer les réservations.');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError('Une erreur est survenue lors du chargement des réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      date: null,
      status: '',
      customer_name: '',
      customer_email: ''
    });
    setCurrentPage(1);
  };

  // Mettre à jour les filtres
  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
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
        // Utiliser bg="secondary" au lieu de bg="info"
        return <Badge bg="secondary">Terminée</Badge>; 
      case 'no_show':
        return <Badge bg="dark">Absence</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Approuver une réservation
  const handleApproveReservation = async (id) => {
    try {
      setLoading(true);
      
      const response = await api.post(`/api/reservations/admin/${id}/approve`);
      
      if (response.data.success) {
        // Mettre à jour la liste des réservations
        fetchReservations();
      } else {
        setError('Erreur lors de l\'approbation de la réservation.');
      }
    } catch (err) {
      console.error('Erreur d\'approbation:', err);
      setError('Une erreur est survenue lors de l\'approbation de la réservation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestion des réservations</h2>
        <Button as={Link} to="/admin/reservations/new" variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nouvelle réservation
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Filtres</h4>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
          </div>
        </Card.Header>
        
        {showFilters && (
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={filters.date}
                    onChange={(date) => handleFilterChange('date', date)}
                    dateFormat="dd/MM/yyyy"
                    locale="fr"
                    placeholderText="Sélectionnez une date"
                    className="form-control"
                    isClearable
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="completed">Terminée</option>
                    <option value="no_show">Absence</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du client</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par nom"
                      value={filters.customer_name}
                      onChange={(e) => handleFilterChange('customer_name', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Email du client</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par email"
                      value={filters.customer_email}
                      onChange={(e) => handleFilterChange('customer_email', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={resetFilters}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-2" style={{ color: '#333' }} />
                Réinitialiser
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => fetchReservations()}
              >
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Rechercher
              </Button>
            </div>
          </Card.Body>
        )}
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
            </div>
          ) : reservations.length === 0 ? (
            <Alert variant="info">
              Aucune réservation trouvée pour les critères sélectionnés.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Client</th>
                    <th>Personnes</th>
                    <th>Table</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{formatDate(reservation.date)}</td>
                      <td className="fw-bold">{formatTime(reservation.time)}</td>
                      <td>
                        <div>{reservation.customer_name}</div>
                        <small className="text-muted">{reservation.customer_email}</small>
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
                        <div className="d-flex">
                          <Button 
                            as={Link} 
                            to={`/admin/reservations/${reservation.id}`} 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            title="Voir les détails"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          
                          <Button 
                            as={Link} 
                            to={`/admin/reservations/${reservation.id}/edit`} 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          
                          {reservation.status === 'pending' && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="me-1"
                              title="Approuver"
                              onClick={() => handleApproveReservation(reservation.id)}
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1} 
                  />
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                  />
                  
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item 
                      key={index + 1} 
                      active={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                  />
                  <Pagination.Last 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages} 
                  />
                </Pagination>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Reservations;