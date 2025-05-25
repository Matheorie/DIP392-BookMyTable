// server/server.js
const { initialize } = require('./config/init');
const { app } = require('./app');
const db = require('./config/db');
const config = require('./config/config');

// Fonction de démarrage du serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('Impossible de se connecter à la base de données. Arrêt du serveur.');
      process.exit(1);
    }
    
    // Initialiser la base de données
    await initialize();
    
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

// Appeler la fonction startServer pour démarrer le serveur
startServer();