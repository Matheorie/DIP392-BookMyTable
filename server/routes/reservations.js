// server/routes/reservations.js
// Routes pour les réservations

const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { auth, isAdmin } = require('../middleware/auth');
const { 
  validateReservation, 
  validateReservationUpdate, 
  validateConfirmationCode 
} = require('../middleware/validation');

// Routes publiques
// Récupérer les disponibilités
router.get('/availability', reservationController.getAvailability);

// Créer une nouvelle réservation
router.post('/', validateReservation, reservationController.createReservation);

// Gestion des réservations par code de confirmation
// Récupérer une réservation par code
router.get('/code/:code', validateConfirmationCode, reservationController.getReservationByCode);

// Mettre à jour une réservation par code
router.put('/code/:code', validateConfirmationCode, validateReservationUpdate, reservationController.updateReservationByCode);

// Annuler une réservation par code
router.delete('/code/:code', validateConfirmationCode, reservationController.cancelReservationByCode);

// Routes administratives (authentifiées)
// Récupérer toutes les réservations
router.get('/admin', auth, reservationController.getAllReservations);

// Récupérer les réservations du jour
router.get('/admin/today', auth, reservationController.getTodayReservations);

// Récupérer une réservation par ID
router.get('/admin/:id', auth, reservationController.getReservationById);

// Mettre à jour une réservation
router.put('/admin/:id', auth, validateReservationUpdate, reservationController.updateReservationById);

// Supprimer une réservation
router.delete('/admin/:id', auth, isAdmin, reservationController.deleteReservation);

// Approuver une réservation
router.post('/admin/:id/approve', auth, reservationController.approveReservation);

module.exports = router;
