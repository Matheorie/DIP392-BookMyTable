// server/controllers/reservationController.js
// Contrôleur pour les réservations

const Reservation = require('../models/Reservation');
const TimeSlot = require('../models/TimeSlot');
const emailService = require('../utils/email');
const helpers = require('../utils/helpers');
const config = require('../config/config');

/**
 * Créer une nouvelle réservation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function createReservation(req, res) {
  try {
    const reservationData = req.body;
    
    // Vérifier que le créneau est disponible
    const availability = await TimeSlot.getAvailability(
      reservationData.date,
      reservationData.party_size
    );
    
    // Trouver le créneau horaire correspondant
    const selectedTime = reservationData.time;
    const isAvailable = availability.some(slot => {
      return slot.start_time === selectedTime && slot.available;
    });
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau horaire n\'est pas disponible. Veuillez choisir un autre horaire.'
      });
    }
    
    // Créer la réservation
    const reservation = await Reservation.create(reservationData);
    
    // Envoyer les emails de confirmation
    await Promise.all([
      emailService.sendReservationConfirmation(reservation),
      emailService.sendNewReservationNotification(reservation)
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès.',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation.'
    });
  }
}

/**
 * Récupérer les détails d'une réservation par code de confirmation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getReservationByCode(req, res) {
  try {
    const { code } = req.params;
    
    const reservation = await Reservation.getByConfirmationCode(code);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation.'
    });
  }
}

/**
 * Mettre à jour une réservation par code de confirmation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateReservationByCode(req, res) {
  try {
    const { code } = req.params;
    const updateData = req.body;
    
    // Récupérer la réservation
    const reservation = await Reservation.getByConfirmationCode(code);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    // Vérifier si la réservation peut être modifiée
    if (reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'no_show') {
      return res.status(400).json({
        success: false,
        message: `Cette réservation ne peut pas être modifiée car elle est ${helpers.getReservationStatusText(reservation.status).toLowerCase()}.`
      });
    }
    
    // Vérifier le délai minimum pour modifier la réservation
    if (helpers.getHoursDifference(reservation.date, reservation.time) < config.reservation.minCancellationTime) {
      return res.status(400).json({
        success: false,
        message: `Les modifications doivent être effectuées au moins ${config.reservation.minCancellationTime} heures à l'avance.`
      });
    }
    
    // Si la date ou l'heure change, vérifier la disponibilité
    if (updateData.date || updateData.time) {
      const newDate = updateData.date || reservation.date;
      const newTime = updateData.time || reservation.time;
      const newPartySize = updateData.party_size || reservation.party_size;
      
      // Vérifier que le créneau est disponible
      const availability = await TimeSlot.getAvailability(newDate, newPartySize);
      
      const isAvailable = availability.some(slot => {
        return slot.start_time === newTime && slot.available;
      });
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Ce créneau horaire n\'est pas disponible. Veuillez choisir un autre horaire.'
        });
      }
      
      // Réinitialiser le statut et l'assignation de table
      updateData.status = 'pending';
      updateData.table_id = null;
      updateData.requires_approval = true;
    }
    
    // Mettre à jour la réservation
    const updatedReservation = await Reservation.update(reservation.id, updateData);
    
    // Envoyer un email de confirmation de la modification
    await emailService.sendReservationUpdate(updatedReservation);
    
    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès.',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation.'
    });
  }
}

/**
 * Annuler une réservation par code de confirmation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function cancelReservationByCode(req, res) {
  try {
    const { code } = req.params;
    
    // Récupérer la réservation
    const reservation = await Reservation.getByConfirmationCode(code);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    // Vérifier si la réservation peut être annulée
    if (reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'no_show') {
      return res.status(400).json({
        success: false,
        message: `Cette réservation ne peut pas être annulée car elle est ${helpers.getReservationStatusText(reservation.status).toLowerCase()}.`
      });
    }
    
    // Vérifier le délai minimum pour annuler la réservation
    if (helpers.getHoursDifference(reservation.date, reservation.time) < config.reservation.minCancellationTime) {
      return res.status(400).json({
        success: false,
        message: `Les annulations doivent être effectuées au moins ${config.reservation.minCancellationTime} heures à l'avance.`
      });
    }
    
    // Mettre à jour le statut de la réservation
    const updatedReservation = await Reservation.update(reservation.id, {
      status: 'cancelled',
      table_id: null
    });
    
    // Envoyer un email de confirmation d'annulation
    await emailService.sendReservationCancellation(updatedReservation);
    
    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès.',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation.'
    });
  }
}

/**
 * Vérifier la disponibilité des créneaux horaires pour le dîner du jeudi
 * Cette fonction est appelée avant de retourner les créneaux disponibles au client
 * @param {Array} timeSlots - Liste des créneaux horaires
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {Array} - Liste des créneaux horaires filtrés
 */
const checkDinnerAvailability = (timeSlots, date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const isThursday = dayOfWeek === 4;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Si c'est un weekend, aucun créneau n'est disponible
  if (isWeekend) {
    return timeSlots.map(slot => ({
      ...slot,
      available: false
    }));
  }
  
  // Filtrer les créneaux de dîner pour qu'ils ne soient disponibles que le jeudi
  return timeSlots.map(slot => {
    if (slot.is_dinner && !isThursday) {
      return {
        ...slot,
        available: false
      };
    }
    return slot;
  });
};

/**
 * Récupérer les disponibilités pour une date
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAvailability(req, res) {
  try {
    const { date, party_size } = req.query;
    
    // Valider la date
    if (!date || !helpers.isValidFutureDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Une date valide dans le futur est requise.'
      });
    }
    
    // Valider le nombre de personnes
    const partyCount = parseInt(party_size) || 2;
    if (partyCount < 1 || partyCount > 20) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre de personnes doit être compris entre 1 et 20.'
      });
    }
    
    // Récupérer les disponibilités
    let availability = await TimeSlot.getAvailability(date, partyCount);
    
    // Vérifier la disponibilité des créneaux de dîner le jeudi
    availability = checkDinnerAvailability(availability, date);
    
    // Grouper les créneaux par type (déjeuner/dîner)
    const lunchSlots = availability.filter(slot => slot.is_lunch);
    const dinnerSlots = availability.filter(slot => slot.is_dinner);
    
    res.status(200).json({
      success: true,
      date,
      party_size: partyCount,
      availability: {
        lunch: lunchSlots,
        dinner: dinnerSlots
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des disponibilités.'
    });
  }
}

// Fonctions pour l'administration

/**
 * Récupérer toutes les réservations (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAllReservations(req, res) {
  try {
    const { date, status, customer_name, customer_email } = req.query;
    
    // Construire les filtres
    const filters = {};
    
    if (date) filters.date = date;
    if (status) filters.status = status;
    if (customer_name) filters.customer_name = customer_name;
    if (customer_email) filters.customer_email = customer_email;
    
    // Récupérer les réservations
    const reservations = await Reservation.search(filters);
    
    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations.'
    });
  }
}

/**
 * Récupérer une réservation par ID (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getReservationById(req, res) {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.getById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Get reservation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation.'
    });
  }
}

/**
 * Mettre à jour une réservation par ID (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateReservationById(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Récupérer la réservation
    const reservation = await Reservation.getById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    // Mettre à jour la réservation
    const updatedReservation = await Reservation.update(id, updateData);
    
    // Si le statut change, envoyer un email de notification
    if (updateData.status && updateData.status !== reservation.status) {
      if (updateData.status === 'confirmed') {
        await emailService.sendReservationConfirmation(updatedReservation);
      } else if (updateData.status === 'cancelled') {
        await emailService.sendReservationCancellation(updatedReservation);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès.',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Update reservation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation.'
    });
  }
}

/**
 * Supprimer une réservation par ID (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function deleteReservation(req, res) {
  try {
    const { id } = req.params;
    
    // Récupérer la réservation
    const reservation = await Reservation.getById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    // Supprimer la réservation
    const isDeleted = await Reservation.delete(id);
    
    if (!isDeleted) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la réservation.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès.'
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réservation.'
    });
  }
}

/**
 * Approuver une réservation (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function approveReservation(req, res) {
  try {
    const { id } = req.params;
    
    // Récupérer la réservation
    const reservation = await Reservation.getById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée.'
      });
    }
    
    // Vérifier si la réservation est en attente
    if (reservation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Seules les réservations en attente peuvent être approuvées.'
      });
    }
    
    // Approuver la réservation et assigner une table
    const approvedReservation = await Reservation.approve(id);
    
    // Envoyer un email de confirmation
    await emailService.sendReservationConfirmation(approvedReservation);
    
    res.status(200).json({
      success: true,
      message: 'Réservation approuvée avec succès.',
      reservation: approvedReservation
    });
  } catch (error) {
    console.error('Approve reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de la réservation.'
    });
  }
}

/**
 * Récupérer les réservations du jour (admin)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getTodayReservations(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer les réservations du jour
    const reservations = await Reservation.getByDate(today);
    
    res.status(200).json({
      success: true,
      date: today,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error('Get today reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations du jour.'
    });
  }
}

module.exports = {
  createReservation,
  getReservationByCode,
  updateReservationByCode,
  cancelReservationByCode,
  getAvailability,
  getAllReservations,
  getReservationById,
  updateReservationById,
  deleteReservation,
  approveReservation,
  getTodayReservations
};
