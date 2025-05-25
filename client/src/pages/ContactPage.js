// client/src/pages/ContactPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faClock,
  faRoute,
  faPaperPlane,
  faCheckCircle,
  faInfoCircle,
  faUtensils,
  faWifi,
  faUniversalAccess,
  faCreditCard,
  faCar,
  faConciergeBell,
  faStar,
  faGlobe,
  faCamera,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import RestaurantHours from '../components/common/RestaurantHours';
import restaurantAmbianceImage from '../assets/images/restaurant-ambiance.jpg';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Animation d'entrée des cartes
  useEffect(() => {
    const cards = document.querySelectorAll('.contact-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200 * index);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation d'envoi de message
    setTimeout(() => {
      setLoading(false);
      setShowAlert(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Masquer l'alerte après 5 secondes
      setTimeout(() => setShowAlert(false), 5000);
    }, 1500);
  };

  const restaurantInfo = {
    name: "Restaurant Cazingue",
    address: "67 Rue Chaptal, 92300 Levallois-Perret",
    phone: "09 73 88 03 94",
    email: "cazingue@gmail.com",
    description: "Dans l'argot parisien, celui de Michel Audiard et de Jean Gabin, un Cazingue est un café, un bistro bruyant des discussions enflammées, des rires et de la musique qui les font vivre.",
    chef: "Emmanuel Belaud",
    capacity: "20-70 personnes",
    rating: 4.9,
    reviewsCount: 49
  };

  const services = [
    { icon: faUtensils, text: "Cuisine française traditionnelle" },
    { icon: faConciergeBell, text: "Service attentionné" },
    { icon: faWifi, text: "Wi-Fi gratuit" },
    { icon: faUniversalAccess, text: "Accès PMR" },
    { icon: faCreditCard, text: "Cartes acceptées" },
    { icon: faCar, text: "Parking à proximité" }
  ];

  const socialLinks = [
    { icon: faGlobe, url: "#", name: "Site Web" },
    { icon: faCamera, url: "#", name: "Photos" },
    { icon: faThumbsUp, url: "#", name: "Avis" }
  ];

  return (
    <section className="section">
      <Container>
        {/* En-tête de la page */}
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8} className="text-center">
            <h1 className="section-title">Contactez-nous</h1>
            <p className="section-subtitle">
              Une question, une demande spéciale ou envie de découvrir notre univers ? 
              Nous sommes là pour vous accueillir et vous renseigner.
            </p>
            <div className="rating-display mb-4">
              <div className="d-flex justify-content-center align-items-center">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon 
                    key={i} 
                    icon={faStar} 
                    className={i < Math.floor(restaurantInfo.rating) ? 'text-warning' : 'text-muted'} 
                  />
                ))}
                <span className="ms-2">
                  <strong>{restaurantInfo.rating}/5</strong> ({restaurantInfo.reviewsCount} avis)
                </span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alerte de confirmation */}
        {showAlert && (
          <Row className="justify-content-center mb-4">
            <Col md={8}>
              <Alert variant="success" className="custom-alert">
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          {/* Informations de contact - Maintenant sur toute la largeur */}
          <Col lg={12} className="mb-5">
            <Row>
              {/* Adresse et contact principal */}
              <Col md={4} className="mb-4">
                <Card className="contact-card h-100 border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
                  <Card.Body className="text-center p-4">
                    <div className="icon-container bg-primary bg-opacity-10 p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" className="text-primary" />
                    </div>
                    <h4>Adresse</h4>
                    <p className="mb-2">{restaurantInfo.address}</p>
                    <small className="text-muted">
                      Métro : Pont de Levallois-Bécon (Ligne 3)<br/>
                      Bus : 93, 53, 238, 167, 275
                    </small>
                    <div className="mt-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        href={`https://maps.google.com/?q=${encodeURIComponent(restaurantInfo.address)}`}
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faRoute} className="me-2" />
                        Itinéraire
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Téléphone et email */}
              <Col md={4} className="mb-4">
                <Card className="contact-card h-100 border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
                  <Card.Body className="text-center p-4">
                    <div className="icon-container bg-success bg-opacity-10 p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                      <FontAwesomeIcon icon={faPhone} size="2x" className="text-success" />
                    </div>
                    <h4>Téléphone</h4>
                    <p className="mb-3">
                      <a href={`tel:${restaurantInfo.phone}`} className="text-decoration-none">
                        {restaurantInfo.phone}
                      </a>
                    </p>
                    <div className="icon-container bg-info bg-opacity-10 p-2 rounded-circle mb-2 mx-auto" style={{ width: 'fit-content' }}>
                      <FontAwesomeIcon icon={faEnvelope} className="text-info" />
                    </div>
                    <p className="mb-0">
                      <a href={`mailto:${restaurantInfo.email}`} className="text-decoration-none">
                        {restaurantInfo.email}
                      </a>
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Formulaire de contact - Maintenant aligné avec les autres cartes */}
              <Col md={4} className="mb-4">
                <Card className="contact-card h-100 border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
                  <Card.Header className="bg-primary text-white text-center">
                    <h4 className="mb-0">
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      Envoyez-nous un message
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom complet *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Votre nom"
                          size="sm"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="votre.email@exemple.com"
                          size="sm"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Téléphone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="06 12 34 56 78"
                          size="sm"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Sujet *</Form.Label>
                        <Form.Select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          size="sm"
                        >
                          <option value="">Choisissez un sujet</option>
                          <option value="reservation">Question sur une réservation</option>
                          <option value="menu">Question sur le menu</option>
                          <option value="event">Événement privé</option>
                          <option value="feedback">Compliment ou suggestion</option>
                          <option value="other">Autre</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          placeholder="Votre message..."
                          size="sm"
                        />
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Horaires - Maintenant en ligne séparée */}
        <Row className="mb-5">
          <Col md={12}>
            <Card className="contact-card border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="icon-container bg-warning bg-opacity-10 p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                    <FontAwesomeIcon icon={faClock} size="2x" className="text-warning" />
                  </div>
                  <h4>Nos Horaires</h4>
                </div>
                <RestaurantHours />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Services */}
        <Row className="mb-5">
          <Col md={12}>
            <Card className="contact-card border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <Card.Body className="p-4">
                <h4 className="text-center mb-4">Nos Services</h4>
                <Row>
                  {services.map((service, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={service.icon} className="text-primary me-3" />
                        <span>{service.text}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section À propos */}
        <Row className="mt-5">
          <Col>
            <Card className="contact-card border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <Card.Body className="p-5">
                <Row className="align-items-center">
                  <Col md={6}>
                    <h3 className="mb-3">À propos du Restaurant Cazingue</h3>
                    <p className="lead mb-3">
                      {restaurantInfo.description}
                    </p>
                    <p>
                      Dirigé par le chef <strong>{restaurantInfo.chef}</strong>, notre établissement 
                      vous propose une cuisine française authentique dans une ambiance conviviale. 
                      Nous pouvons accueillir de {restaurantInfo.capacity} dans nos espaces modulables.
                    </p>
                    <p className="mb-4">
                      Que ce soit pour un déjeuner d'affaires, un dîner en famille ou un événement spécial, 
                      notre équipe s'adapte à toutes vos demandes avec des prestations sur-mesure.
                    </p>
                    
                    {/* Réseaux sociaux */}
                    <div>
                      <h5 className="mb-3">Suivez-nous</h5>
                      <div className="d-flex gap-3">
                        {socialLinks.map((social, index) => (
                          <a 
                            key={index}
                            href={social.url}
                            className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px' }}
                            title={social.name}
                          >
                            <FontAwesomeIcon icon={social.icon} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-center">
                    <div className="restaurant-image-container position-relative">
                      <img 
                        src={restaurantAmbianceImage}
                        alt="Ambiance chaleureuse du Restaurant Cazingue"
                        className="img-fluid rounded shadow"
                        style={{ 
                          width: '100%',
                          height: '380px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="image-overlay position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-3 rounded-bottom">
                        <p className="mb-0 fw-bold">
                          Une ambiance chaleureuse<br/>
                          au cœur de Levallois-Perret
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Carte interactive (placeholder) */}
        <Row className="mt-5">
          <Col>
            <Card className="contact-card border-0 shadow-sm" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <Card.Header className="bg-primary text-white text-center">
                <h4 className="mb-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Nous trouver
                </h4>
              </Card.Header>
              <Card.Body className="p-0">
                <div 
                  className="map-placeholder bg-light d-flex align-items-center justify-content-center"
                  style={{ height: '300px' }}
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="text-primary mb-3" />
                    <h5>Restaurant Cazingue</h5>
                    <p className="mb-3">{restaurantInfo.address}</p>
                    <Button 
                      variant="primary"
                      href={`https://maps.google.com/?q=${encodeURIComponent(restaurantInfo.address)}`}
                      target="_blank"
                    >
                      <FontAwesomeIcon icon={faRoute} className="me-2" />
                      Voir sur Google Maps
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call-to-action */}
        <Row className="mt-5 text-center">
          <Col>
            <div className="contact-card p-4" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <h3 className="mb-3">Prêt à nous rendre visite ?</h3>
              <p className="lead mb-4">
                Réservez votre table dès maintenant pour une expérience culinaire inoubliable.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button 
                  as="a" 
                  href="/reservation" 
                  variant="primary" 
                  size="lg"
                  className="custom-btn"
                >
                  <FontAwesomeIcon icon={faUtensils} className="me-2" />
                  Réserver une table
                </Button>
                <Button 
                  as="a" 
                  href="/menu" 
                  variant="outline-primary" 
                  size="lg"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Découvrir le menu
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ContactPage;