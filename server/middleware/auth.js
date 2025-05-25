// server/middleware/auth.js
// Middleware d'authentification

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Middleware pour vérifier l'authentification JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
async function auth(req, res, next) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token non fourni.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Récupérer l'utilisateur
    const user = await User.getById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification.'
    });
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits d\'administrateur requis.'
    });
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié ou un administrateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function authOrAdmin(req, res, next) {
  if (req.user) {
    next();
  } else {
    // Vérifier si l'utilisateur est authentifié via une session
    if (req.session && req.session.userId) {
      req.user = { id: req.session.userId };
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }
  }
}

module.exports = {
  auth,
  isAdmin,
  authOrAdmin
};
