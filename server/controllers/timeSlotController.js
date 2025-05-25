// server/controllers/timeSlotController.js
// Contrôleur pour les créneaux horaires

const TimeSlot = require('../models/TimeSlot');

/**
 * Récupérer tous les créneaux horaires
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAllTimeSlots(req, res) {
  try {
    const timeSlots = await TimeSlot.getAll();
    
    res.status(200).json({
      success: true,
      count: timeSlots.length,
      timeSlots
    });
  } catch (error) {
    console.error('Get all time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux horaires.'
    });
  }
}

/**
 * Récupérer les créneaux horaires pour le déjeuner
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getLunchTimeSlots(req, res) {
  try {
    const lunchSlots = await TimeSlot.getLunchSlots();
    
    res.status(200).json({
      success: true,
      count: lunchSlots.length,
      timeSlots: lunchSlots
    });
  } catch (error) {
    console.error('Get lunch time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux de déjeuner.'
    });
  }
}

/**
 * Récupérer les créneaux horaires pour le dîner
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getDinnerTimeSlots(req, res) {
  try {
    const dinnerSlots = await TimeSlot.getDinnerSlots();
    
    res.status(200).json({
      success: true,
      count: dinnerSlots.length,
      timeSlots: dinnerSlots
    });
  } catch (error) {
    console.error('Get dinner time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux de dîner.'
    });
  }
}

/**
 * Créer un nouveau créneau horaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function createTimeSlot(req, res) {
  try {
    const timeSlotData = req.body;
    
    const timeSlot = await TimeSlot.create(timeSlotData);
    
    res.status(201).json({
      success: true,
      message: 'Créneau horaire créé avec succès.',
      timeSlot
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du créneau horaire.'
    });
  }
}

/**
 * Mettre à jour un créneau horaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateTimeSlot(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mettre à jour le créneau horaire
    try {
      const updatedTimeSlot = await TimeSlot.update(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Créneau horaire mis à jour avec succès.',
        timeSlot: updatedTimeSlot
      });
    } catch (error) {
      if (error.message.includes('Time slot not found')) {
        return res.status(404).json({
          success: false,
          message: 'Créneau horaire non trouvé.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du créneau horaire.'
    });
  }
}

/**
 * Supprimer un créneau horaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function deleteTimeSlot(req, res) {
  try {
    const { id } = req.params;
    
    // Supprimer le créneau horaire
    const isDeleted = await TimeSlot.delete(id);
    
    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Créneau horaire non trouvé.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Créneau horaire supprimé avec succès.'
    });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du créneau horaire.'
    });
  }
}

module.exports = {
  getAllTimeSlots,
  getLunchTimeSlots,
  getDinnerTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
};
