// client/src/pages/ReservationForm.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  faComment 
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

const ReservationForm = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState({ lunch: [], dinner: [] });
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  
  // Mettre à jour le statut isThursday quand la date change
  useEffect(() => {
    if (selectedDate) {
      // En JavaScript, getDay() retourne 0 pour dimanche, 1 pour lundi, etc.
      // Donc jeudi correspond à 4
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
      setLoading(true);
      setError('');
      
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
      setError('Erreur lors de la récupération des disponibilités. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      
      // Formater la date pour l'API
      const formattedDate = values.date.toISOString().split('T')[0];
      
      const reservationData = {
        ...values,
        date: formattedDate
      };
      
      const response = await api.post('/api/reservations', reservationData);
      
      if (response.data.success) {
        // Rediriger vers la page de confirmation
        navigate(`/confirmation/${response.data.reservation.confirmation_code}`);
      } else {
        setError('Erreur lors de la création de la réservation.');
      }
    } catch (err) {
      console.error('Erreur de réservation:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la réservation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <section className="section">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card>
              <Card.Header className="text-center">
                <h2 className="mb-0">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Réserver une table
                </h2>
              </Card.Header>
              
              <Card.Body>
                {error && (
                  <Alert variant="danger">
                    {error}
                  </Alert>
                )}
                
                <Formik
                  initialValues={{
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    date: '',
                    time: '',
                    party_size: 2,
                    comments: ''
                  }}
                  validationSchema={reservationSchema}
                  onSubmit={handleSubmit}
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
                              placeholder="Votre nom complet"
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
                              placeholder="votre.email@exemple.com"
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
                              placeholder="06 12 34 56 78"
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
                              loading ? (
                                <div className="text-center py-3">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {availableTimeSlots.lunch.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="mb-2">Déjeuner</h6>
                                      <div className="time-slots">
                                        {availableTimeSlots.lunch.map((slot) => (
                                          <Button
                                            key={slot.id}
                                            variant={slot.available ? "outline-primary" : "outline-secondary"}
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
                                            // Important: Ne pas désactiver les créneaux de dîner le jeudi
                                            // disabled={!slot.available}
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
                                  
                                  {availableTimeSlots.lunch.length === 0 && (!isThursday || availableTimeSlots.dinner.length === 0) && (
                                    <Alert variant="warning">
                                      Aucun créneau disponible pour cette date et ce nombre de personnes.
                                    </Alert>
                                  )}
                                </>
                              )
                            ) : (
                              <Alert variant="info" className="custom-alert">
                                Veuillez d'abord sélectionner une date.
                                {!isThursday && (
                                  <p className="mb-0 mt-2"><strong>Note :</strong> Le service du dîner n'est disponible que le jeudi.</p>
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
                      
                      <div className="text-center">
                        <Button
                          className="custom-btn"
                          type="submit"
                          variant="primary"
                          size="lg"
                          disabled={isSubmitting || loading || !selectedTime}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                              Confirmer la réservation
                            </>
                          )}
                        </Button>
                      </div>
                      
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Besoin d'aide pour votre réservation ? Contactez-nous au 09 73 88 03 94
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ReservationForm;