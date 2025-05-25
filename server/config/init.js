// server/config/init.js
const bcrypt = require('bcrypt');
const db = require('./db');

/**
 * Initialiser l'administrateur
 * Cette fonction vérifie si un utilisateur administrateur existe
 * et le crée s'il n'existe pas
 */
async function initializeAdmin() {
  try {
    console.log('Vérification de l\'existence d\'un utilisateur administrateur...');
    
    // Vérifier si un administrateur existe déjà
    const admins = await db.query('SELECT * FROM users WHERE role = "admin"');
    
    // Vérifier si nous avons des résultats
    if (!admins || admins.length === 0) {
      console.log('Aucun administrateur trouvé. Création de l\'utilisateur administrateur par défaut...');
      
      // Utiliser des variables d'environnement ou des valeurs par défaut
      const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@cazingue.fr';
      
      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      
      // Insérer l'administrateur
      await db.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [adminUsername, hashedPassword, adminEmail, 'admin']
      );
      
      console.log(`Utilisateur administrateur "${adminUsername}" créé avec succès!`);
    } else {
      console.log('Un ou plusieurs administrateurs trouvés. Aucune action nécessaire.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'administrateur:', error);
    throw error;
  }
}

/**
 * Initialiser la base de données
 * Cette fonction exécute toutes les initialisations nécessaires
 */
async function initialize() {
  try {
    console.log('Initialisation de la base de données...');
    
    // Initialiser l'administrateur
    await initializeAdmin();
    
    // Vérifier et créer les paramètres manquants
    await checkSettings();
    
    console.log('Initialisation de la base de données terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

/**
 * Vérifier et créer les paramètres manquants
 */
async function checkSettings() {
  try {
    console.log('Vérification des paramètres de l\'application...');
    
    // Liste des paramètres requis
    const requiredSettings = [
      { key: 'min_advance_time', value: '1', type: 'integer', description: 'Temps minimum en heures pour effectuer une réservation à l\'avance' },
      { key: 'max_advance_time', value: '720', type: 'integer', description: 'Temps maximum en heures pour effectuer une réservation à l\'avance (30 jours)' },
      { key: 'min_cancellation_time', value: '2', type: 'integer', description: 'Temps minimum en heures pour annuler une réservation avant l\'heure prévue' },
      { key: 'confirmation_required', value: 'true', type: 'boolean', description: 'Nécessité de confirmation manuelle par le gérant' }
    ];
    
    // Récupérer les paramètres existants
    const existingSettings = await db.query('SELECT setting_key FROM settings');
    
    // Vérifier si le résultat existe et extraire les clés
    const existingKeys = [];
    if (existingSettings && existingSettings.length > 0) {
      existingSettings.forEach(setting => {
        if (setting && setting.setting_key) {
          existingKeys.push(setting.setting_key);
        }
      });
    }
    
    // Créer les paramètres manquants
    for (const setting of requiredSettings) {
      if (!existingKeys.includes(setting.key)) {
        console.log(`Création du paramètre manquant: ${setting.key}`);
        
        await db.query(
          'INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)',
          [setting.key, setting.value, setting.type, setting.description]
        );
      }
    }
    
    console.log('Vérification des paramètres terminée!');
  } catch (error) {
    console.error('Erreur lors de la vérification des paramètres:', error);
    throw error;
  }
}

module.exports = { initialize, initializeAdmin };