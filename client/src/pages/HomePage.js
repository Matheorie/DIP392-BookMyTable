// client/src/pages/HomePage.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUtensils, 
  faClock,
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';
import RestaurantHours from '../components/common/RestaurantHours';
import heroImage from '../assets/images/restaurant-hero.jpg';
import chefImage from '../assets/images/chef.jpg';
import interiorImage from '../assets/images/restaurant-interior.jpg';
import foodImage from '../assets/images/food.jpg';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero bg-dark text-white mb-5" style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 0',
        marginTop: '-40px',
      }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-4">Restaurant Cazingue</h1>
              <p className="lead mb-4">Une expérience culinaire française authentique au cœur de Levallois-Perret</p>
              <Link to="/reservation" className="btn custom-btn btn-lg me-3">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Réserver une table
              </Link>
              <Link to="/menu" className="btn btn-outline-light btn-lg">
                <FontAwesomeIcon icon={faUtensils} className="me-2" />
                Découvrir notre menu
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Introduction Section */}
      <section className="section">
        <Container>
          <Row>
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="mb-4">Bienvenue au Restaurant Cazingue</h2>
              <p className="lead">Un lieu où tradition et modernité se rencontrent pour vous offrir une expérience culinaire exceptionnelle.</p>
              <p>Fondé par le chef Emmanuel Belaud, le Restaurant Cazingue vous propose une cuisine française authentique élaborée avec des produits frais et locaux. Notre équipe passionnée vous accueille dans un cadre chaleureux et élégant pour un moment de plaisir gustatif.</p>
              <p>Que ce soit pour un déjeuner d'affaires, un dîner romantique ou une réunion familiale, notre restaurant s'adapte à toutes vos envies.</p>
              
              <div className="mt-4">
                <Link to="/contact" className="btn custom-btn me-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Nous trouver
                </Link>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src={chefImage} 
                alt="Chef Emmanuel Belaud" 
                className="img-fluid rounded shadow" 
                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Pourquoi nous choisir</h2>
              <p className="section-subtitle">Des moments uniques, des saveurs inoubliables</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faUtensils} size="3x" color="#4a6da7" />
                  </div>
                  <Card.Title>Cuisine Authentique</Card.Title>
                  <Card.Text>
                    Des plats traditionnels français revisités avec une touche de modernité. Notre chef utilise des ingrédients locaux et de saison pour vous offrir le meilleur de la gastronomie.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faCalendarAlt} size="3x" color="#4a6da7" />
                  </div>
                  <Card.Title>Réservation Simple</Card.Title>
                  <Card.Text>
                    Réservez votre table en quelques clics, 24h/24 et 7j/7. Notre système vous permet de choisir votre date, heure et nombre de convives selon vos préférences.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faClock} size="3x" color="#4a6da7" />
                  </div>
                  <Card.Title>Service Attentionné</Card.Title>
                  <Card.Text>
                    Notre équipe attentive veille à ce que votre expérience soit parfaite du début à la fin. Nous prenons soin de chaque détail pour rendre votre visite mémorable.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Horaires Section */}
      <section className="section">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <div className="text-center mb-5">
                <h2 className="section-title">Nos Horaires</h2>
                <p className="section-subtitle">Planifiez votre visite au Restaurant Cazingue</p>
              </div>
              <RestaurantHours />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Gallery Section */}
      <section className="section bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Notre Univers</h2>
              <p className="section-subtitle">Découvrez l'ambiance et la cuisine du Restaurant Cazingue</p>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-4">
              <img 
                src={interiorImage} 
                alt="Intérieur du Restaurant Cazingue" 
                className="img-fluid rounded shadow w-100" 
                style={{ height: '300px', objectFit: 'cover' }}
              />
              <h4 className="mt-3">Un cadre élégant</h4>
              <p>Notre salle au design contemporain vous accueille dans une ambiance chaleureuse et raffinée.</p>
            </Col>
            <Col md={6} className="mb-4">
              <img 
                src={foodImage} 
                alt="Plat signature du Restaurant Cazingue" 
                className="img-fluid rounded shadow w-100" 
                style={{ height: '300px', objectFit: 'cover' }}
              />
              <h4 className="mt-3">Une cuisine d'exception</h4>
              <p>Des plats préparés avec passion, alliant tradition française et créativité culinaire.</p>
            </Col>
          </Row>
          <Row className="text-center mt-3">
            <Col>
              <Link to="/reservation" className="btn custom-btn btn-lg">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Réserver votre table
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default HomePage;