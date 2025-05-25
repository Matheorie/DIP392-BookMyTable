// server/routes/timeSlots.js
// Routes pour les créneaux horaires

const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');
const { auth, isAdmin } = require('../middleware/auth');
const { validateTimeSlot } = require('../middleware/validation');

// Récupérer tous les créneaux horaires
router.get('/', auth, timeSlotController.getAllTimeSlots);

// Récupérer les créneaux de déjeuner
router.get('/lunch', auth, timeSlotController.getLunchTimeSlots);

// Récupérer les créneaux de dîner
router.get('/dinner', auth, timeSlotController.getDinnerTimeSlots);

// Créer un nouveau créneau horaire (admin uniquement)
router.post('/', auth, isAdmin, validateTimeSlot, timeSlotController.createTimeSlot);

// Mettre à jour un créneau horaire (admin uniquement)
router.put('/:id', auth, isAdmin, validateTimeSlot, timeSlotController.updateTimeSlot);

// Supprimer un créneau horaire (admin uniquement)
router.delete('/:id', auth, isAdmin, timeSlotController.deleteTimeSlot);

module.exports = router;
