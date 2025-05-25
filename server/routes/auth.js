// server/routes/auth.js
// Routes pour l'authentification

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateLogin, validateUser } = require('../middleware/validation');

// Route de connexion
router.post('/login', validateLogin, authController.login);

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', auth, authController.getMe);

// Route pour créer un nouvel utilisateur (réservé aux administrateurs)
router.post('/register', auth, validateUser, authController.register);

// Route pour mettre à jour le mot de passe
router.put('/update-password', auth, authController.updatePassword);

module.exports = router;
