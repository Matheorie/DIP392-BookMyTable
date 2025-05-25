// client/src/pages/MenuPage.js
// Créé le 22/05/2025 pour le Restaurant Cazingue
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faWineGlass, faCoffee, faCheese, faLeaf, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const MenuPage = () => {
  // État pour stocker des informations à propos du menu, facilitant les futures mises à jour
  const [menuInfo] = useState({
    lastUpdated: "22 mai 2025",
    menuTitle: "Le midi Cazingue vous propose"
  });

  // Configuration des catégories de menu et de leurs items
  // Cette structure facilite la mise à jour future du menu
  const [menuCategories] = useState([
    {
      id: 'entrees',
      title: 'Entrées',
      price: '5€',
      priceWithMain: '3€ avec 1 plat',
      icon: faLeaf,
      items: [
        { name: 'Œuf mayonnaise', description: '' },
        { name: 'Velouté de panais', description: '' },
        { name: 'Noix de St Jacques au paprika', description: '' }
      ]
    },
    {
      id: 'plats',
      title: 'Plats',
      icon: faUtensils,
      items: [
        { name: 'Fusilli putanesca ou crème de courgette', price: '10€' },
        { name: 'Filet d\'aiglefin sauce corail, riz vapeur, brocolis', price: '14€' },
        { name: 'Moussaka au bœuf, salade', price: '13€' },
        { name: 'Burger raclette, frites, carottes râpées', price: '16€' }
      ]
    },
    {
      id: 'fromages',
      title: 'Assiette de fromages',
      price: '7€',
      priceWithMain: '4€ avec 1 plat',
      icon: faCheese,
      items: []
    },
    {
      id: 'desserts',
      title: 'Desserts',
      price: '6€',
      priceWithMain: '3€ avec 1 plat',
      icon: faCoffee,
      items: [
        { name: 'Compote poire-kiwi', description: '' },
        { name: 'Brownie', description: '' },
        { name: 'Galette charentaise, fromage blanc au cognac', description: '' }
      ]
    },
    {
      id: 'options',
      title: 'Café gourmand',
      price: '6€',
      icon: faCoffee,
      items: []
    },
    {
      id: 'boissons',
      title: 'Boissons',
      icon: faWineGlass,
      items: [
        { name: 'La Gallia IPA', price: '4€ (le demi)' },
        { name: 'Kir', price: '4€' },
        { name: 'Picon bière', price: '4,50€' },
        { name: 'Pinte de Mars', price: '6€' },
        { name: 'Demi de Heineken', price: '4€' },
        { name: 'Verre de Bourgogne', price: '4€' }
      ]
    },
    {
      id: 'vins',
      title: 'Vins',
      icon: faWineGlass,
      items: [
        { name: 'Merlot et Syrah Pays d\'Oc "Roméo et Julieta" 2019', prices: [
          { label: 'Le verre', price: '5€' },
          { label: 'Le quart', price: '8€' },
          { label: 'Le demi', price: '15€' },
          { label: 'La bouteille', price: '29€' }
        ] },
        { name: 'Bordeaux entre deux mers "Vieilles Vignes"', description: '' }
      ]
    }
  ]);

  // Style de l'effet "craie" pour l'écriture
  const chalkTextStyle = {
    fontFamily: "'Caveat', 'Indie Flower', cursive",
    color: 'white',
    textShadow: '0px 0px 3px rgba(255, 255, 255, 0.5)',
    lineHeight: '1.4'
  };

  // Style pour l'effet d'ardoise
  const chalkboardStyle = {
    backgroundColor: '#333',
    backgroundImage: 'linear-gradient(rgba(50, 50, 50, 0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(50, 50, 50, 0.7) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 80px rgba(0, 0, 0, 0.2)',
    padding: '30px',
    marginBottom: '20px'
  };

  // Style pour les prix spéciaux
  const priceBubbleStyle = {
    display: 'inline-block',
    border: '2px solid rgba(255, 255, 255, 0.7)',
    borderRadius: '20px',
    padding: '6px 12px',
    margin: '5px 0',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  };

  // Effets de chargement de la page
  useEffect(() => {
    // Animation pour l'effet de "dessin à la craie"
    const items = document.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, 100 * index);
    });
  }, []);

  return (
    <section className="section">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8}>
            <div className="text-center mb-5">
              <h1 className="section-title">Notre Menu</h1>
              <p className="text-muted">
                Découvrez les saveurs authentiques du Restaurant Cazingue. 
                Notre menu change régulièrement selon les saisons et l'inspiration de notre chef.
              </p>
              <p className="text-muted fst-italic">
                Dernière mise à jour : {menuInfo.lastUpdated}
              </p>
            </div>

            {/* Ardoise du menu */}
            <div style={chalkboardStyle}>
              <div className="mb-4 text-center">
                <h2 style={{...chalkTextStyle, fontSize: '2.2rem', borderBottom: '2px solid rgba(255, 255, 255, 0.3)', paddingBottom: '10px'}}>
                  {menuInfo.menuTitle}
                </h2>
              </div>

              {/* Catégories de menu */}
              {menuCategories.map((category) => (
                <div key={category.id} className="mb-4 menu-item" style={{opacity: 0, transform: 'translateY(20px)'}}>
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={category.icon} className="me-2" style={chalkTextStyle} />
                    <h3 style={{...chalkTextStyle, fontSize: '1.8rem', margin: 0}}>
                      {category.title}
                      {category.price && 
                        <span style={{...chalkTextStyle, fontSize: '1.5rem', marginLeft: '10px'}}>
                          : {category.price}
                        </span>
                      }
                    </h3>
                  </div>
                  
                  {category.priceWithMain && (
                    <p style={{...chalkTextStyle, fontSize: '1.2rem', marginLeft: '25px', opacity: 0.9}}>
                      ({category.priceWithMain})
                    </p>
                  )}

                  <ul style={{listStyle: 'none', padding: '0 0 0 25px'}}>
                    {category.items.map((item, index) => (
                      <li key={index} className="mb-3 menu-item" style={{opacity: 0, transform: 'translateY(10px)'}}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{...chalkTextStyle, fontSize: '1.4rem'}}>
                            - {item.name}
                            {item.description && 
                              <span style={{...chalkTextStyle, fontSize: '1.2rem', opacity: 0.8, display: 'block', marginLeft: '10px'}}>
                                {item.description}
                              </span>
                            }
                          </div>
                          
                          {item.price && 
                            <span style={{...chalkTextStyle, fontSize: '1.4rem', marginLeft: '10px'}}>
                              {item.price}
                            </span>
                          }
                        </div>

                        {/* Pour les items avec plusieurs prix (comme les vins) */}
                        {item.prices && (
                          <div style={{marginLeft: '15px', marginTop: '5px'}}>
                            {item.prices.map((priceObj, priceIndex) => (
                              <div key={priceIndex} style={{...chalkTextStyle, fontSize: '1.2rem', display: 'inline-block', marginRight: '15px'}}>
                                <span style={priceBubbleStyle}>
                                  {priceObj.label}: {priceObj.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-5 text-center">
              <p className="text-muted">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Notre menu change régulièrement en fonction des saisons et des arrivages frais.
                Les prix et disponibilités peuvent varier. Si vous avez des allergies ou des restrictions alimentaires,
                n'hésitez pas à nous en informer lors de votre réservation.
              </p>
            </div>

            <div className="text-center mt-5">
              <a href="/reservation" className="btn custom-btn btn-lg">
                <FontAwesomeIcon icon={faUtensils} className="me-2" />
                Réserver une table
              </a>
            </div>
          </Col>
        </Row>
      </Container>

      {/* CSS pour l'animation d'entrée des items du menu */}
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&display=swap');
        
        .menu-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        
        .chalk-effect {
          position: relative;
        }
        
        .chalk-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

export default MenuPage;