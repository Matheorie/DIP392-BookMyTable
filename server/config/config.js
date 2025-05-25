// server/config/config.js
// Configuration générale de l'application

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Configuration de l'environnement
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Configuration de la base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookmytable',
    port: process.env.DB_PORT || 3306
  },
  
  // Configuration JWT pour l'authentification
  jwt: {
    secret: process.env.JWT_SECRET || 'bookMyTableSecretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Configuration de l'email
  email: {
    service: process.env.EMAIL_SERVICE || 'smtp',
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || 'votre_identifiant_mailtrap',
      pass: process.env.EMAIL_PASSWORD || 'votre_mot_de_passe_mailtrap',
    },
    from: process.env.EMAIL_FROM || 'Restaurant Cazingue <notifications@cazingue.fr>'
  },
  
  // Paramètres de réservation
  reservation: {
    minAdvanceTime: 1, // Minimum d'heures à l'avance pour réserver
    maxAdvanceTime: 60 * 24 * 30, // Maximum d'heures à l'avance (30 jours)
    minCancellationTime: 2, // Minimum d'heures à l'avance pour annuler
    confirmationRequired: true, // Confirmation du gérant requise pour chaque réservation
  }
};
