// server/controllers/tableController.js
// Contrôleur pour les tables

const Table = require('../models/Table');

/**
 * Récupérer toutes les tables
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAllTables(req, res) {
  try {
    const tables = await Table.getAll();
    
    res.status(200).json({
      success: true,
      count: tables.length,
      tables
    });
  } catch (error) {
    console.error('Get all tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tables.'
    });
  }
}

/**
 * Récupérer une table par ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getTableById(req, res) {
  try {
    const { id } = req.params;
    
    const table = await Table.getById(id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée.'
      });
    }
    
    res.status(200).json({
      success: true,
      table
    });
  } catch (error) {
    console.error('Get table by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la table.'
    });
  }
}

/**
 * Créer une nouvelle table
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function createTable(req, res) {
  try {
    const tableData = req.body;
    
    const table = await Table.create(tableData);
    
    res.status(201).json({
      success: true,
      message: 'Table créée avec succès.',
      table
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la table.'
    });
  }
}

/**
 * Mettre à jour une table
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateTable(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Vérifier si la table existe
    const table = await Table.getById(id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée.'
      });
    }
    
    // Mettre à jour la table
    const updatedTable = await Table.update(id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Table mise à jour avec succès.',
      table: updatedTable
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la table.'
    });
  }
}

/**
 * Supprimer une table
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function deleteTable(req, res) {
  try {
    const { id } = req.params;
    
    // Vérifier si la table existe
    const table = await Table.getById(id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée.'
      });
    }
    
    // Supprimer la table
    try {
      const isDeleted = await Table.delete(id);
      
      if (!isDeleted) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression de la table.'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Table supprimée avec succès.'
      });
    } catch (error) {
      // Gérer l'erreur spécifique lorsqu'une table a des réservations futures
      if (error.message.includes('Cannot delete table with future reservations')) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer cette table car elle a des réservations futures.'
        });
      }
      throw error; // Re-lancer l'erreur pour qu'elle soit attrapée par le bloc catch externe
    }
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la table.'
    });
  }
}

/**
 * Mettre à jour le statut d'une table
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateTableStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Vérifier si la table existe
    const table = await Table.getById(id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée.'
      });
    }
    
    // Vérifier si le statut est valide
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de table invalide.'
      });
    }
    
    // Mettre à jour le statut de la table
    const updatedTable = await Table.updateStatus(id, status);
    
    res.status(200).json({
      success: true,
      message: 'Statut de la table mis à jour avec succès.',
      table: updatedTable
    });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la table.'
    });
  }
}

/**
 * Récupérer les tables disponibles pour une date, heure et taille de groupe
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAvailableTables(req, res) {
  try {
    const { date, time, party_size } = req.query;
    
    // Valider les paramètres
    if (!date || !time || !party_size) {
      return res.status(400).json({
        success: false,
        message: 'La date, l\'heure et le nombre de personnes sont requis.'
      });
    }
    
    // Convertir le nombre de personnes en entier
    const partyCount = parseInt(party_size);
    
    if (isNaN(partyCount) || partyCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre de personnes doit être un entier positif.'
      });
    }
    
    // Récupérer les tables disponibles
    const availableTables = await Table.getAvailable(date, time, partyCount);
    
    res.status(200).json({
      success: true,
      count: availableTables.length,
      tables: availableTables
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tables disponibles.'
    });
  }
}

/**
 * Récupérer le statut des tables pour une date spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getTableStatusByDate(req, res) {
  try {
    const { date } = req.params;
    
    // Utiliser la date du jour si aucune date n'est spécifiée
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Récupérer le statut des tables
    const tableStatus = await Table.getTableStatusByDate(targetDate);
    
    // Grouper les résultats par table
    const tables = {};
    
    tableStatus.forEach(row => {
      const tableId = row.id;
      
      if (!tables[tableId]) {
        tables[tableId] = {
          id: row.id,
          number: row.number,
          capacity: row.capacity,
          status: row.status,
          description: row.description,
          reservations: []
        };
      }
      
      // Ajouter la réservation si elle existe
      if (row.reservation_id) {
        tables[tableId].reservations.push({
          id: row.reservation_id,
          time: row.reservation_time,
          party_size: row.party_size,
          customer_name: row.customer_name,
          status: row.reservation_status
        });
      }
    });
    
    res.status(200).json({
      success: true,
      date: targetDate,
      tables: Object.values(tables)
    });
  } catch (error) {
    console.error('Get table status by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut des tables.'
    });
  }
}

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAvailableTables,
  getTableStatusByDate
};