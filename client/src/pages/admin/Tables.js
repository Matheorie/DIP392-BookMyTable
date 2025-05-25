// client/src/pages/admin/Tables.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChair, 
  faCalendarAlt, 
  faPlus, 
  faEdit, 
  faTrash,
  faSave,
  faTimes,
  faExclamationTriangle,
  faCheck,
  faUsers,
  faEye,
  faSyncAlt,
  faFilter,
  faMapMarkerAlt,
  faCoffee,
  faUtensils,
  faWifi,
  faGlassWhiskey,
  faCouch,
  faTree
} from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';
import 'react-datepicker/dist/react-datepicker.css';

// Enregistrer la locale française pour le calendrier
registerLocale('fr', fr);

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tableStatuses, setTableStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 2,
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [filterCapacity, setFilterCapacity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Icônes pour différents types de tables
  const getTableIcon = (description) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('fenêtre')) return faTree;
    if (desc.includes('bar')) return faGlassWhiskey;
    if (desc.includes('romantique')) return faCoffee;
    if (desc.includes('groupe')) return faUsers;
    if (desc.includes('coin')) return faCouch;
    return faChair;
  };

  // Couleurs pour les capacités
  const getCapacityColor = (capacity) => {
    if (capacity <= 2) return 'primary';
    if (capacity <= 4) return 'success';
    if (capacity <= 6) return 'warning';
    return 'danger';
  };

  // Récupérer les tables
  useEffect(() => {
    fetchTables();
  }, []);
  
  // Récupérer le statut des tables pour la date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      fetchTableStatuses(selectedDate);
    }
  }, [selectedDate]);
  
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/tables');
      
      if (response.data.success) {
        setTables(response.data.tables);
      } else {
        setError('Impossible de récupérer les tables.');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des tables:', err);
      setError('Une erreur est survenue lors du chargement des tables. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTableStatuses = async (date) => {
    try {
      setLoading(true);
      
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await api.get(`/api/tables/status/${formattedDate}`);
      
      if (response.data.success) {
        setTableStatuses(response.data.tables);
      } else {
        setError('Impossible de récupérer le statut des tables.');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du statut des tables:', err);
      setError('Une erreur est survenue lors du chargement du statut des tables. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer le changement de statut d'une table
  const handleStatusChange = async (tableId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await api.patch(`/api/tables/${tableId}/status`, { status: newStatus });
      
      if (response.data.success) {
        fetchTableStatuses(selectedDate);
      } else {
        setError('Impossible de mettre à jour le statut de la table.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Une erreur est survenue lors de la mise à jour du statut. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Ouvrir le modal d'ajout de table
  const openAddModal = () => {
    setFormData({
      number: '',
      capacity: 2,
      description: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };
  
  // Ouvrir le modal de modification
  const openEditModal = (table) => {
    setCurrentTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      description: table.description || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };
  
  // Ouvrir le modal de suppression
  const openDeleteModal = (table) => {
    setCurrentTable(table);
    setShowDeleteModal(true);
  };

  // Ouvrir le modal de détails
  const openDetailsModal = (table) => {
    setCurrentTable(table);
    setShowDetailsModal(true);
  };
  
  // Gérer le changement des champs du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.number) {
      errors.number = 'Le numéro de table est requis';
    } else if (isNaN(formData.number) || parseInt(formData.number) < 1) {
      errors.number = 'Le numéro de table doit être un entier positif';
    }
    
    if (!formData.capacity) {
      errors.capacity = 'La capacité est requise';
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity) < 1 || parseInt(formData.capacity) > 20) {
      errors.capacity = 'La capacité doit être comprise entre 1 et 20';
    }
    
    if (formData.description && formData.description.length > 255) {
      errors.description = 'La description ne doit pas dépasser 255 caractères';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Ajouter une table
  const handleAddTable = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitLoading(true);
      
      const tableData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await api.post('/api/tables', tableData);
      
      if (response.data.success) {
        setShowAddModal(false);
        fetchTables();
        fetchTableStatuses(selectedDate);
      } else {
        setError('Impossible d\'ajouter la table.');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la table:', err);
      setError('Une erreur est survenue lors de l\'ajout de la table. Veuillez réessayer.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Modifier une table
  const handleEditTable = async () => {
    if (!validateForm() || !currentTable) return;
    
    try {
      setSubmitLoading(true);
      
      const tableData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await api.put(`/api/tables/${currentTable.id}`, tableData);
      
      if (response.data.success) {
        setShowEditModal(false);
        fetchTables();
        fetchTableStatuses(selectedDate);
      } else {
        setError('Impossible de modifier la table.');
      }
    } catch (err) {
      console.error('Erreur lors de la modification de la table:', err);
      setError('Une erreur est survenue lors de la modification de la table. Veuillez réessayer.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Supprimer une table
  const handleDeleteTable = async () => {
    if (!currentTable) return;
    
    try {
      setSubmitLoading(true);
      
      const response = await api.delete(`/api/tables/${currentTable.id}`);
      
      if (response.data.success) {
        setShowDeleteModal(false);
        fetchTables();
        fetchTableStatuses(selectedDate);
      } else {
        setError('Impossible de supprimer la table.');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la table:', err);
      let errorMsg = 'Une erreur est survenue lors de la suppression de la table. Veuillez réessayer.';
      
      if (err.response && err.response.data && err.response.data.message.includes('réservations futures')) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Obtenir la classe CSS pour le statut de la table
  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'danger';
      case 'reserved':
        return 'warning';
      case 'maintenance':
        return 'secondary';
      default:
        return 'primary';
    }
  };
  
  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupée';
      case 'reserved':
        return 'Réservée';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };
  
  // Formater l'heure pour l'affichage
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Filtrer les tables
  const filteredTables = tableStatuses.filter(table => {
    if (filterCapacity && table.capacity < parseInt(filterCapacity)) {
      return false;
    }
    if (filterStatus && table.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterCapacity('');
    setFilterStatus('');
  };

  return (
    <Container className="py-4">
      {/* En-tête avec titre et actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FontAwesomeIcon icon={faChair} className="me-2 text-primary" />
            Gestion des Tables
          </h2>
          <p className="text-muted mb-0">Gérez vos tables et suivez leur occupation en temps réel</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <i className="fas fa-th me-1"></i>
            Grille
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list me-1"></i>
            Liste
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nouvelle Table
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Row className="mb-4">
        {[
          { label: 'Total Tables', value: tables.length, icon: faChair, color: 'primary' },
          { label: 'Disponibles', value: filteredTables.filter(t => t.status === 'available').length, icon: faCheck, color: 'success' },
          { label: 'Occupées', value: filteredTables.filter(t => t.status === 'occupied').length, icon: faUsers, color: 'danger' },
          { label: 'Réservées', value: filteredTables.filter(t => t.status === 'reserved').length, icon: faCalendarAlt, color: 'warning' }
        ].map((stat, index) => (
          <Col md={3} key={index} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className={`icon-container bg-${stat.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                  <FontAwesomeIcon icon={stat.icon} size="lg" className={`text-${stat.color}`} />
                </div>
                <div>
                  <h3 className="mb-0">{stat.value}</h3>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtres et contrôles */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                  <strong className="me-3">Date sélectionnée :</strong>
                  <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
                    dateFormat="dd/MM/yyyy"
                    locale="fr"
                    className="form-control form-control-sm"
                    style={{ width: '150px' }}
                  />
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => fetchTableStatuses(selectedDate)}
                >
                  <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                  Actualiser
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFilter} className="me-2 text-primary" />
                <Form.Select
                  size="sm"
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  className="me-2"
                >
                  <option value="">Toutes capacités</option>
                  <option value="2">2+ personnes</option>
                  <option value="4">4+ personnes</option>
                  <option value="6">6+ personnes</option>
                  <option value="8">8+ personnes</option>
                </Form.Select>
                <Form.Select
                  size="sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="me-2"
                >
                  <option value="">Tous statuts</option>
                  <option value="available">Disponible</option>
                  <option value="occupied">Occupée</option>
                  <option value="reserved">Réservée</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
                {(filterCapacity || filterStatus) && (
                  <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Affichage des tables */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      ) : filteredTables.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <FontAwesomeIcon icon={faChair} size="3x" className="mb-3 text-muted" />
          <h4>Aucune table à afficher</h4>
          <p>Aucune table ne correspond aux critères sélectionnés.</p>
        </Alert>
      ) : viewMode === 'grid' ? (
        // Vue en grille - moderne et attractive
        <Row>
          {filteredTables.map((table) => (
            <Col xl={3} lg={4} md={6} key={table.id} className="mb-4">
              <Card className={`h-100 border-0 shadow-sm table-card table-${table.status}`} 
                    style={{ 
                      borderLeft: `4px solid var(--bs-${getStatusClass(table.status)})`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => openDetailsModal(table)}>
                <Card.Body className="p-3">
                  {/* En-tête de la carte */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className={`icon-container bg-${getCapacityColor(table.capacity)} bg-opacity-10 p-2 rounded-circle me-2`}>
                        <FontAwesomeIcon 
                          icon={getTableIcon(table.description)} 
                          className={`text-${getCapacityColor(table.capacity)}`} 
                        />
                      </div>
                      <div>
                        <h5 className="mb-0">Table {table.number}</h5>
                        <small className="text-muted">
                          <FontAwesomeIcon icon={faUsers} className="me-1" />
                          {table.capacity} pers.
                        </small>
                      </div>
                    </div>
                    <Badge bg={getStatusClass(table.status)} className="status-badge">
                      {getStatusText(table.status)}
                    </Badge>
                  </div>

                  {/* Description */}
                  {table.description && (
                    <p className="text-muted small mb-3" style={{ fontSize: '0.85rem' }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                      {table.description}
                    </p>
                  )}

                  {/* Réservations du jour */}
                  {table.reservations && table.reservations.length > 0 && (
                    <div className="reservations-today mb-3">
                      <small className="text-muted d-block mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        Réservations aujourd'hui :
                      </small>
                      <div className="reservations-list">
                        {table.reservations.slice(0, 2).map((res, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                            <Badge variant="outline-primary" className="time-badge">
                              {formatTime(res.time)}
                            </Badge>
                            <small className="text-muted">
                              {res.customer_name} ({res.party_size}p)
                            </small>
                          </div>
                        ))}
                        {table.reservations.length > 2 && (
                          <small className="text-muted">
                            +{table.reservations.length - 2} autre(s)...
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contrôle du statut */}
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Select 
                      size="sm"
                      value={table.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(table.id, e.target.value);
                      }}
                      className="status-select"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <option value="available">Disponible</option>
                      <option value="occupied">Occupée</option>
                      <option value="reserved">Réservée</option>
                      <option value="maintenance">Maintenance</option>
                    </Form.Select>
                    
                    <div className="table-actions">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modifier la table</Tooltip>}
                      >
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(table);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      </OverlayTrigger>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Supprimer la table</Tooltip>}
                      >
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(table);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        // Vue en liste - plus classique mais efficace
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faChair} className="me-2" />
              Liste des Tables ({filteredTables.length})
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Table</th>
                    <th>Capacité</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Réservations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => (
                    <tr key={table.id} className={`table-row-${table.status}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`icon-container bg-${getCapacityColor(table.capacity)} bg-opacity-10 p-2 rounded-circle me-2`}>
                            <FontAwesomeIcon 
                              icon={getTableIcon(table.description)} 
                              className={`text-${getCapacityColor(table.capacity)}`} 
                            />
                          </div>
                          <strong>Table {table.number}</strong>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getCapacityColor(table.capacity)} className="capacity-badge">
                          <FontAwesomeIcon icon={faUsers} className="me-1" />
                          {table.capacity}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {table.description || '-'}
                        </small>
                      </td>
                      <td>
                        <Form.Select 
                          size="sm"
                          value={table.status}
                          onChange={(e) => handleStatusChange(table.id, e.target.value)}
                          className={`status-select-${table.status}`}
                        >
                          <option value="available">Disponible</option>
                          <option value="occupied">Occupée</option>
                          <option value="reserved">Réservée</option>
                          <option value="maintenance">Maintenance</option>
                        </Form.Select>
                      </td>
                      <td>
                        {table.reservations && table.reservations.length > 0 ? (
                          <div>
                            <Badge variant="outline-primary" className="me-1">
                              {table.reservations.length} rés.
                            </Badge>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              onClick={() => openDetailsModal(table)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted">Aucune</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => openEditModal(table)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => openDeleteModal(table)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Modal d'ajout de table */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Ajouter une nouvelle table
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faChair} className="me-2" />
                    Numéro de table
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="number"
                    value={formData.number}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.number}
                    placeholder="Ex: 1, 2, 3..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.number}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Capacité
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.capacity}
                    min={1}
                    max={20}
                    placeholder="Nombre de personnes"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Description (optionnelle)
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                isInvalid={!!formErrors.description}
                rows={3}
                placeholder="Ex: Table près de la fenêtre, Table romantique, Table de groupe..."
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Décrivez l'emplacement ou les caractéristiques particulières de cette table
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="primary"
            onClick={handleAddTable}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Ajout en cours...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Ajouter la table
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de modification de table */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Modifier la table {currentTable?.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faChair} className="me-2" />
                    Numéro de table
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="number"
                    value={formData.number}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.number}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.number}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Capacité
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.capacity}
                    min={1}
                    max={20}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                isInvalid={!!formErrors.description}
                rows={3}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="warning"
            onClick={handleEditTable}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Modification...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Enregistrer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de suppression de table */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FontAwesomeIcon icon={faTrash} size="3x" className="text-danger mb-3" />
            <h5>Supprimer la table {currentTable?.number} ?</h5>
            <p className="text-muted">
              Cette action est irréversible. Toutes les données associées à cette table seront perdues.
            </p>
            {currentTable?.description && (
              <div className="alert alert-light">
                <small>
                  <strong>Description :</strong> {currentTable.description}
                </small>
              </div>
            )}
            <p className="small text-warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
              Note: Vous ne pouvez pas supprimer une table qui a des réservations futures.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteTable}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de détails de table */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faEye} className="me-2" />
            Détails de la table {currentTable?.number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTable && (
            <div>
              {/* Informations générales */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-primary mb-3">
                        <FontAwesomeIcon icon={faChair} className="me-2" />
                        Informations générales
                      </h6>
                      <div className="mb-2">
                        <strong>Numéro :</strong> {currentTable.number}
                      </div>
                      <div className="mb-2">
                        <strong>Capacité :</strong> 
                        <Badge bg={getCapacityColor(currentTable.capacity)} className="ms-2">
                          <FontAwesomeIcon icon={faUsers} className="me-1" />
                          {currentTable.capacity} personnes
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Statut :</strong> 
                        <Badge bg={getStatusClass(currentTable.status)} className="ms-2">
                          {getStatusText(currentTable.status)}
                        </Badge>
                      </div>
                      {currentTable.description && (
                        <div>
                          <strong>Description :</strong>
                          <p className="text-muted mt-1 mb-0">{currentTable.description}</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-primary mb-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        Réservations du {selectedDate.toLocaleDateString('fr-FR')}
                      </h6>
                      {currentTable.reservations && currentTable.reservations.length > 0 ? (
                        <div>
                          {currentTable.reservations.map((reservation, index) => (
                            <div key={index} className="reservation-item p-2 mb-2 rounded border">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{formatTime(reservation.time)}</strong>
                                  <span className="ms-2 text-muted">
                                    {reservation.customer_name}
                                  </span>
                                </div>
                                <div>
                                  <Badge variant="outline-primary">
                                    {reservation.party_size} pers.
                                  </Badge>
                                  <Badge 
                                    bg={reservation.status === 'confirmed' ? 'success' : 'warning'} 
                                    className="ms-1"
                                  >
                                    {reservation.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted py-3">
                          <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="mb-2" />
                          <p className="mb-0">Aucune réservation pour cette date</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Actions rapides */}
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h6 className="text-primary mb-3">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Actions rapides
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setShowDetailsModal(false);
                        openEditModal(currentTable);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => handleStatusChange(currentTable.id, 'available')}
                      disabled={currentTable.status === 'available'}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Marquer disponible
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => handleStatusChange(currentTable.id, 'occupied')}
                      disabled={currentTable.status === 'occupied'}
                    >
                      <FontAwesomeIcon icon={faUsers} className="me-1" />
                      Marquer occupée
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleStatusChange(currentTable.id, 'maintenance')}
                      disabled={currentTable.status === 'maintenance'}
                    >
                      <FontAwesomeIcon icon={faUtensils} className="me-1" />
                      Maintenance
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS personnalisés pour une meilleure apparence */}
      <style jsx>{`
        .table-card {
          transition: all 0.3s ease;
        }
        
        .table-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
        
        .table-available {
          border-left-color: #28a745 !important;
        }
        
        .table-occupied {
          border-left-color: #dc3545 !important;
        }
        
        .table-reserved {
          border-left-color: #ffc107 !important;
        }
        
        .table-maintenance {
          border-left-color: #6c757d !important;
        }
        
        .status-badge {
          font-size: 0.75rem;
          padding: 0.25em 0.5em;
        }
        
        .capacity-badge {
          font-size: 0.8rem;
        }
        
        .time-badge {
          font-size: 0.7rem;
          padding: 0.2em 0.4em;
        }
        
        .reservations-list {
          max-height: 80px;
          overflow-y: auto;
        }
        
        .reservation-item {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .table-actions .btn {
          padding: 0.25rem 0.5rem;
        }
        
        .status-select {
          max-width: 120px;
        }
        
        .table-row-available {
          background-color: rgba(40, 167, 69, 0.05);
        }
        
        .table-row-occupied {
          background-color: rgba(220, 53, 69, 0.05);
        }
        
        .table-row-reserved {
          background-color: rgba(255, 193, 7, 0.05);
        }
        
        .table-row-maintenance {
          background-color: rgba(108, 117, 125, 0.05);
        }
        
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
        }
        
        .react-datepicker-wrapper {
          width: 150px;
        }
        
        .react-datepicker-popper {
          z-index: 1050;
        }
      `}</style>
    </Container>
  );
};

export default Tables;