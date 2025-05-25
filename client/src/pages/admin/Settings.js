// client/src/pages/admin/Settings.js
import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faUsers, 
  faCog, 
  faSave, 
  faPlus, 
  faUserPlus,
  faExclamationTriangle,
  faCheckCircle,
  faCalendarAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';

// Schéma de validation pour le changement de mot de passe
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Le mot de passe actuel est requis'),
  newPassword: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    )
    .required('Le nouveau mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
    .required('Veuillez confirmer le mot de passe')
});

// Schéma de validation pour l'ajout d'utilisateur
const userSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .required('Le nom d\'utilisateur est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    )
    .required('Le mot de passe est requis'),
  role: Yup.string()
    .oneOf(['admin', 'staff'], 'Rôle invalide')
    .required('Le rôle est requis')
});

// Schéma de validation pour les paramètres de réservation
const reservationSettingsSchema = Yup.object().shape({
  minAdvanceTime: Yup.number()
    .min(0, 'La valeur doit être positive')
    .required('Ce champ est requis'),
  maxAdvanceTime: Yup.number()
    .min(1, 'La valeur doit être supérieure à 0')
    .required('Ce champ est requis'),
  minCancellationTime: Yup.number()
    .min(0, 'La valeur doit être positive')
    .required('Ce champ est requis'),
  confirmationRequired: Yup.boolean()
});

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [userSuccess, setUserSuccess] = useState(false);
  const [userError, setUserError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Changer le mot de passe
  const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      setPasswordError('');
      setPasswordSuccess(false);
      
      const response = await api.put('/api/auth/update-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      if (response.data.success) {
        setPasswordSuccess(true);
        resetForm();
      } else {
        setPasswordError('Erreur lors du changement de mot de passe.');
      }
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Ajouter un utilisateur
  const handleAddUser = async (values, { setSubmitting, resetForm }) => {
    try {
      setUserError('');
      setUserSuccess(false);
      
      const response = await api.post('/api/auth/register', values);
      
      if (response.data.success) {
        setUserSuccess(true);
        resetForm();
      } else {
        setUserError('Erreur lors de la création de l\'utilisateur.');
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      setUserError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mettre à jour les paramètres de réservation
  const handleUpdateSettings = async (values, { setSubmitting }) => {
    try {
      setSettingsError('');
      setSettingsSuccess(false);
      
      // Simuler une mise à jour des paramètres
      // Dans une application réelle, vous feriez une requête API ici
      console.log('Paramètres mis à jour:', values);
      
      // Simule une requête réussie
      setTimeout(() => {
        setSettingsSuccess(true);
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      setSettingsError('Erreur lors de la mise à jour des paramètres. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Paramètres</h2>
      
      <Tab.Container id="settings-tabs" defaultActiveKey="account">
        <Row>
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="account" className="rounded-0">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Mon compte
                    </Nav.Link>
                  </Nav.Item>
                  {user?.role === 'admin' && (
                    <>
                      <Nav.Item>
                        <Nav.Link eventKey="users" className="rounded-0">
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          Utilisateurs
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="reservation" className="rounded-0">
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                          Paramètres de réservation
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                </Nav>
              </Card.Body>
            </Card>
            
            <div className="mt-4">
              <div className="card border-0 shadow-sm p-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div>
                    <h6 className="mb-0">{user?.username}</h6>
                    <small className="text-muted">{user?.role === 'admin' ? 'Administrateur' : 'Personnel'}</small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              {/* Onglet Mon compte */}
              <Tab.Pane eventKey="account">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Changer le mot de passe
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    {passwordSuccess && (
                      <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Votre mot de passe a été mis à jour avec succès.
                      </Alert>
                    )}
                    
                    {passwordError && (
                      <Alert variant="danger" className="mb-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        {passwordError}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      }}
                      validationSchema={passwordSchema}
                      onSubmit={handleChangePassword}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Mot de passe actuel</Form.Label>
                            <Form.Control
                              type="password"
                              name="currentPassword"
                              value={values.currentPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.currentPassword && errors.currentPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.currentPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Nouveau mot de passe</Form.Label>
                            <Form.Control
                              type="password"
                              name="newPassword"
                              value={values.newPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.newPassword && errors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.newPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-4">
                            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={values.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.confirmPassword && errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <div className="d-grid">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Mise à jour en cours...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faSave} className="me-2" />
                                  Mettre à jour le mot de passe
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              {/* Onglet Utilisateurs (admin uniquement) */}
              <Tab.Pane eventKey="users">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Ajouter un utilisateur
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    {userSuccess && (
                      <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        L'utilisateur a été créé avec succès.
                      </Alert>
                    )}
                    
                    {userError && (
                      <Alert variant="danger" className="mb-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        {userError}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        username: '',
                        email: '',
                        password: '',
                        role: 'staff'
                      }}
                      validationSchema={userSchema}
                      onSubmit={handleAddUser}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Nom d'utilisateur</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="username"
                                  value={values.username}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.username && errors.username}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.username}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={values.email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.email && errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.email}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Mot de passe</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="password"
                                  value={values.password}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.password && errors.password}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.password}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Rôle</Form.Label>
                                <Form.Select
                                  name="role"
                                  value={values.role}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.role && errors.role}
                                >
                                  <option value="staff">Personnel</option>
                                  <option value="admin">Administrateur</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                  {errors.role}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          
                          <div className="d-grid mt-3">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Création en cours...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                  Créer l'utilisateur
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              {/* Onglet Paramètres de réservation (admin uniquement) */}
              <Tab.Pane eventKey="reservation">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Paramètres de réservation
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    {settingsSuccess && (
                      <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Les paramètres ont été mis à jour avec succès.
                      </Alert>
                    )}
                    
                    {settingsError && (
                      <Alert variant="danger" className="mb-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        {settingsError}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        minAdvanceTime: 1,
                        maxAdvanceTime: 720, // 30 jours en heures
                        minCancellationTime: 2,
                        confirmationRequired: true
                      }}
                      validationSchema={reservationSettingsSchema}
                      onSubmit={handleUpdateSettings}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faClock} className="me-2" />
                              Temps minimum à l'avance pour réserver (heures)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name="minAdvanceTime"
                              value={values.minAdvanceTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.minAdvanceTime && errors.minAdvanceTime}
                            />
                            <Form.Text className="text-muted">
                              Le temps minimum avant l'heure de réservation qu'un client doit respecter
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.minAdvanceTime}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                              Temps maximum à l'avance pour réserver (heures)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name="maxAdvanceTime"
                              value={values.maxAdvanceTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.maxAdvanceTime && errors.maxAdvanceTime}
                            />
                            <Form.Text className="text-muted">
                              Le temps maximum avant l'heure de réservation qu'un client peut faire sa réservation (ex: 720 = 30 jours)
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.maxAdvanceTime}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faClock} className="me-2" />
                              Temps minimum pour annuler (heures)
                            </Form.Label>
                            <Form.Control
                              type="number"
                              name="minCancellationTime"
                              value={values.minCancellationTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.minCancellationTime && errors.minCancellationTime}
                            />
                            <Form.Text className="text-muted">
                              Le temps minimum avant l'heure de réservation qu'un client peut annuler sa réservation
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.minCancellationTime}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-4">
                            <Form.Check
                              type="switch"
                              id="confirmationRequired"
                              name="confirmationRequired"
                              label="Confirmation manuelle requise pour chaque réservation"
                              checked={values.confirmationRequired}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Text className="text-muted">
                              Si activé, toutes les réservations seront en attente jusqu'à confirmation par un administrateur
                            </Form.Text>
                          </Form.Group>
                          
                          <div className="d-grid">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Mise à jour en cours...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faSave} className="me-2" />
                                  Enregistrer les paramètres
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Settings;