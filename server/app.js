// server/app.js
// Point d'entrée de l'application Express

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const db = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const timeSlotRoutes = require('./routes/timeSlots');

// Initialiser l'application Express
const app = express();

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Middlewares
app.use(helmet()); // Sécurité
app.use(cors()); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parser le JSON
app.use(express.urlencoded({ extended: true })); // Parser les formulaires

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/timeslots', timeSlotRoutes);

// Route pour la page d'administration
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'admin.html'));
});

// Route par défaut pour l'application frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur.',
    error: config.env === 'development' ? err.message : undefined
  });
});

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('Impossible de se connecter à la base de données. Arrêt du serveur.');
      process.exit(1);
    }
    
    // Démarrer le serveur
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT} en mode ${config.env}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

module.exports = { app, startServer };
