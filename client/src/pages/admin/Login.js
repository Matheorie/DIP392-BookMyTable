// client/src/pages/admin/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import logo from '../../assets/images/logo.png';

// Schéma de validation
const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Le nom d\'utilisateur est requis'),
  password: Yup.string()
    .required('Le mot de passe est requis')
});

const Login = () => {
  const { login, isAuthenticated, error: authError } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de redirection si présente
  const from = location.state?.from?.pathname || "/admin/dashboard";

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const result = await login(values.username, values.password);
      
      if (!result.success) {
        setError(result.error || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <img src={logo} alt="Restaurant Cazingue" height="80" />
            <h2 className="mt-3 mb-4">Administration</h2>
          </div>
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Connexion
              </h4>
            </Card.Header>
            
            <Card.Body className="p-4">
              {(error || authError) && (
                <Alert variant="danger" className="mb-4">
                  {error || authError}
                </Alert>
              )}
              
              <Formik
                initialValues={{
                  username: '',
                  password: ''
                }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
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
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Nom d'utilisateur
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && errors.username}
                        placeholder="Entrez votre nom d'utilisateur"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Mot de passe
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                        placeholder="Entrez votre mot de passe"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Connexion en cours...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                            Se connecter
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
              Espace réservé au personnel du restaurant.
              <br />
              Si vous souhaitez réserver une table, veuillez utiliser le <a href="/reservation">formulaire de réservation</a>.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;