// client/src/pages/ManageReservation.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Modal, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock, 
  faUsers, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faComment,
  faEdit,
  faTrash,
  faExclamationTriangle,
  faSave,
  faTimes,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import 'react-datepicker/dist/react-datepicker.css';

// Enregistrer la locale française pour le calendrier
registerLocale('fr', fr);

// Schéma de validation du formulaire
const reservationSchema = Yup.object().shape({
  customer_name: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  customer_email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  customer_phone: Yup.string()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .required('Le numéro de téléphone est requis'),
  date: Yup.date()
    .min(new Date(), 'La date doit être dans le futur')
    .required('La date est requise'),
  time: Yup.string()
    .required('L\'heure est requise'),
  party_size: Yup.number()
    .min(1, 'Le nombre de personnes doit être d\'au moins 1')
    .max(20, 'Le nombre de personnes ne peut pas dépasser 20')
    .required('Le nombre de personnes est requis'),
  comments: Yup.string()
    .max(500, 'Les commentaires ne doivent pas dépasser 500 caractères')
});

const ManageReservation = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState({ lunch: [], dinner: [] });
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [partySizes, setPartySizes] = useState([]);
  const [isThursday, setIsThursday] = useState(false);

  // Initialiser les options de nombre de personnes
  useEffect(() => {
    const sizes = [];
    for (let i = 1; i <= 20; i++) {
      sizes.push(i);
    }
    setPartySizes(sizes);
  }, []);

  // Récupérer les détails de la réservation
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/reservations/code/${code}`);
        
        if (response.data.success) {
          const res = response.data.reservation;
          setReservation(res);
          
          // Convertir la date string en objet Date pour le DatePicker
          if (res.date) {
            const date = new Date(res.date);
            setSelectedDate(date);
            
            // Vérifier si c'est un jeudi (4)
            setIsThursday(date.getDay() === 4);
          }
          
          if (res.time) {
            setSelectedTime(res.time);
          }
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

  // Mettre à jour le statut isThursday quand la date change
  useEffect(() => {
    if (selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      setIsThursday(dayOfWeek === 4);
    } else {
      setIsThursday(false);
    }
  }, [selectedDate]);

  // Charger les disponibilités lorsque la date ou le nombre de personnes change
  const loadAvailability = async (date, partySize) => {
    if (!date || !partySize) return;
    
    try {
      setLoadingAvailability(true);
      
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await api.get('/api/reservations/availability', {
        params: {
          date: formattedDate,
          party_size: partySize
        }
      });
      
      if (response.data.success) {
        setAvailableTimeSlots(response.data.availability);
      } else {
        setError('Erreur lors de la récupération des disponibilités.');
      }
    } catch (err) {
      console.error('Erreur de disponibilité:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

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

  // Filtrer les dates dans le passé et les weekends pour le calendrier
  const filterAvailableDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Date dans le passé
    if (date < today) {
      return false;
    }
    
    // Samedi (6) ou Dimanche (0)
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return false;
    }
    
    return true;
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente de confirmation';
      case 'confirmed':
        return 'Confirmée';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      case 'no_show':
        return 'Absence';
      default:
        return status;
    }
  };

  // Gérer la mise à jour de la réservation
  const handleUpdateReservation = async (values, { setSubmitting }) => {
    try {
      setError('');
      setUpdateSuccess(false);
      
      // Formater la date pour l'API
      const formattedDate = values.date.toISOString().split('T')[0];
      
      const updateData = {
        ...values,
        date: formattedDate
      };
      
      const response = await api.put(`/api/reservations/code/${code}`, updateData);
      
      if (response.data.success) {
        setReservation(response.data.reservation);
        setIsEditing(false);
        setUpdateSuccess(true);
        
        // Faire défiler jusqu'au message de succès
        window.scrollTo(0, 0);
      } else {
        setError('Erreur lors de la mise à jour de la réservation.');
      }
    } catch (err) {
      console.error('Erreur de mise à jour:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la réservation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Gérer l'annulation de la réservation
  const handleCancelReservation = async () => {
    try {
      setCancelLoading(true);
      setCancelError('');
      
      const response = await api.delete(`/api/reservations/code/${code}`);
      
      if (response.data.success) {
        setShowCancelModal(false);
        // Mettre à jour la réservation avec le nouveau statut
        setReservation(response.data.reservation);
      } else {
        setCancelError('Erreur lors de l\'annulation de la réservation.');
      }
    } catch (err) {
      console.error('Erreur d\'annulation:', err);
      setCancelError(err.response?.data?.message || 'Erreur lors de l\'annulation de la réservation. Veuillez réessayer.');
    } finally {
      setCancelLoading(false);
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

  if (error && !reservation) {
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

  const canModify = reservation.status !== 'cancelled' && reservation.status !== 'completed' && reservation.status !== 'no_show';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          {updateSuccess && (
            <Alert variant="success" className="mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Votre réservation a été mise à jour avec succès !
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" className="mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
              {error}
            </Alert>
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Gérer votre réservation</h3>
              {!isEditing && canModify && (
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier
                </Button>
              )}
            </Card.Header>
            
            <Card.Body>
              <Alert 
                variant={
                  reservation.status === 'confirmed' 
                    ? 'success' 
                    : reservation.status === 'pending' 
                      ? 'warning' 
                      : 'danger'
                }
                className="mb-4"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon 
                    icon={
                      reservation.status === 'confirmed' 
                        ? faCheckCircle 
                        : faExclamationCircle
                    } 
                    size="lg" 
                    className="me-3" 
                  />
                  <div>
                    <strong>Statut : {getStatusText(reservation.status)}</strong>
                    {reservation.status === 'pending' && (
                      <p className="mb-0 small">
                        Votre réservation est en attente de confirmation par notre équipe.
                      </p>
                    )}
                    {reservation.status === 'cancelled' && (
                      <p className="mb-0 small">
                        Cette réservation a été annulée et ne peut plus être modifiée.
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
              
              {!isEditing ? (
                // Mode affichage
                <div>
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2 mb-3">Détails de la réservation</h5>
                    
                    <Row className="mb-3">
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
                    
                    <Row className="mb-3">
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
                    
                    <h5 className="border-bottom pb-2 mb-3 mt-4">Vos coordonnées</h5>
                    
                    <Row className="mb-3">
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
                    
                    <div className="d-flex justify-content-center mt-4 pt-3">
                      {canModify && (
                        <>
                          <Button 
                            variant="primary" 
                            className="me-3" 
                            onClick={() => setIsEditing(true)}
                          >
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Modifier la réservation
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            onClick={() => setShowCancelModal(true)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                            Annuler la réservation
                          </Button>
                        </>
                      )}
                      
                      {!canModify && (
                        <Link to="/reservation" className="btn btn-primary">
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                          Nouvelle réservation
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Mode édition
                <Formik
                  initialValues={{
                    customer_name: reservation.customer_name || '',
                    customer_email: reservation.customer_email || '',
                    customer_phone: reservation.customer_phone || '',
                    date: selectedDate || new Date(),
                    time: reservation.time || '',
                    party_size: reservation.party_size || 2,
                    comments: reservation.comments || ''
                  }}
                  validationSchema={reservationSchema}
                  onSubmit={handleUpdateReservation}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              Nom complet
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="customer_name"
                              value={values.customer_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.customer_name && errors.customer_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.customer_name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                              Email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="customer_email"
                              value={values.customer_email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.customer_email && errors.customer_email}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.customer_email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faPhone} className="me-2" />
                              Téléphone
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="customer_phone"
                              value={values.customer_phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.customer_phone && errors.customer_phone}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.customer_phone}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faUsers} className="me-2" />
                              Nombre de personnes
                            </Form.Label>
                            <Form.Select
                              name="party_size"
                              value={values.party_size}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setFieldValue('party_size', value);
                                // Charger les disponibilités si une date est déjà sélectionnée
                                if (selectedDate) {
                                  loadAvailability(selectedDate, value);
                                }
                              }}
                              onBlur={handleBlur}
                              isInvalid={touched.party_size && errors.party_size}
                            >
                              {partySizes.map(size => (
                                <option key={size} value={size}>
                                  {size} {size === 1 ? 'personne' : 'personnes'}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.party_size}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                              Date
                            </Form.Label>
                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => {
                                setSelectedDate(date);
                                setFieldValue('date', date);
                                // Réinitialiser l'heure sélectionnée
                                setSelectedTime('');
                                setFieldValue('time', '');
                                // Charger les disponibilités
                                loadAvailability(date, values.party_size);
                              }}
                              dateFormat="dd/MM/yyyy"
                              locale="fr"
                              minDate={new Date()}
                              filterDate={filterAvailableDates}
                              placeholderText="Sélectionnez une date"
                              className={`form-control ${touched.date && errors.date ? 'is-invalid' : ''}`}
                              calendarClassName="reservation-calendar"
                            />
                            {touched.date && errors.date && (
                              <div className="invalid-feedback d-block">
                                {errors.date}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faClock} className="me-2" />
                              Heure
                            </Form.Label>
                            
                            {selectedDate ? (
                              loadingAvailability ? (
                                <div className="text-center py-3">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {availableTimeSlots.lunch && availableTimeSlots.lunch.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="mb-2">Déjeuner</h6>
                                      <div className="time-slots">
                                        {availableTimeSlots.lunch.map((slot) => (
                                          <Button
                                            key={slot.id}
                                            variant="outline-primary"
                                            className={`time-slot ${selectedTime === slot.start_time ? 'active' : ''}`}
                                            onClick={() => {
                                              if (slot.available) {
                                                setSelectedTime(slot.start_time);
                                                setFieldValue('time', slot.start_time);
                                              }
                                            }}
                                            disabled={!slot.available}
                                            size="sm"
                                          >
                                            {slot.start_time.substring(0, 5)}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {isThursday && availableTimeSlots.dinner && availableTimeSlots.dinner.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="mb-2">
                                        Dîner
                                      </h6>
                                      <div className="time-slots">
                                        {availableTimeSlots.dinner.map((slot) => (
                                          <Button
                                            key={slot.id}
                                            variant="outline-primary" 
                                            className={`time-slot ${selectedTime === slot.start_time ? 'active' : ''}`}
                                            onClick={() => {
                                              setSelectedTime(slot.start_time);
                                              setFieldValue('time', slot.start_time);
                                            }}
                                            // Ne pas désactiver les créneaux de dîner le jeudi
                                            size="sm"
                                          >
                                            {slot.start_time.substring(0, 5)}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {touched.time && errors.time && (
                                    <div className="text-danger mt-1">
                                      {errors.time}
                                    </div>
                                  )}
                                  
                                  {(!availableTimeSlots.lunch || availableTimeSlots.lunch.length === 0) && 
                                   (!isThursday || !availableTimeSlots.dinner || availableTimeSlots.dinner.length === 0) && (
                                    <Alert variant="warning">
                                      Aucun créneau disponible pour cette date et ce nombre de personnes.
                                    </Alert>
                                  )}
                                </>
                              )
                            ) : (
                              <Alert variant="info">
                                Veuillez d'abord sélectionner une date.
                                {!isThursday && (
                                  <p className="mb-0 mt-2"><strong>Note:</strong> Le service du dîner n'est disponible que le jeudi.</p>
                                )}
                              </Alert>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>
                          <FontAwesomeIcon icon={faComment} className="me-2" />
                          Commentaires (optionnel)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="comments"
                          value={values.comments}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.comments && errors.comments}
                          rows={3}
                          placeholder="Allergies, préférences, occasions spéciales..."
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.comments}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <div className="d-flex justify-content-center mt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          className="me-3"
                          disabled={isSubmitting || loadingAvailability}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faSave} className="me-2" />
                              Enregistrer les modifications
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-2" />
                          Annuler
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal de confirmation d'annulation */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger me-2" />
            Confirmer l'annulation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir annuler votre réservation ?</p>
          <p className="mb-0 text-danger"><strong>Cette action est irréversible.</strong></p>
          
          {cancelError && (
            <Alert variant="danger" className="mt-3">
              {cancelError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Non, revenir en arrière
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelReservation}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Annulation...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Oui, annuler ma réservation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageReservation;