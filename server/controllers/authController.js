// server/controllers/authController.js
// Contrôleur pour l'authentification

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Connexion d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Vérifier les identifiants
    const user = await User.verifyCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.'
      });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // Répondre avec le token et les infos utilisateur
    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.'
    });
  }
}

/**
 * Récupérer les informations de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getMe(req, res) {
  try {
    // L'utilisateur est déjà attaché à la requête par le middleware auth
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations utilisateur.'
    });
  }
}

/**
 * Créer un nouvel utilisateur (réservé aux administrateurs)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function register(req, res) {
  try {
    // Vérifier si l'utilisateur actuel est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits d\'administrateur requis.'
      });
    }
    
    const { username, password, email, role } = req.body;
    
    // Vérifier si le nom d'utilisateur existe déjà
    const existingUser = await User.getByUsername(username);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ce nom d\'utilisateur est déjà utilisé.'
      });
    }
    
    // Créer le nouvel utilisateur
    const newUser = await User.create({
      username,
      password,
      email,
      role: role || 'staff'
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur.'
    });
  }
}

/**
 * Mettre à jour le mot de passe de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Vérifier le mot de passe actuel
    const user = await User.verifyCredentials(req.user.username, currentPassword);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect.'
      });
    }
    
    // Mettre à jour le mot de passe
    await User.update(user.id, { password: newPassword });
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe.'
    });
  }
}

module.exports = {
  login,
  getMe,
  register,
  updatePassword
};
