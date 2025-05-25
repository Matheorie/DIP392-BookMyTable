// server/routes/tables.js
// Routes pour les tables

const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { auth, isAdmin } = require('../middleware/auth');
const { validateTable } = require('../middleware/validation');

// Récupérer toutes les tables
router.get('/', auth, tableController.getAllTables);

// Récupérer les tables disponibles
router.get('/available', auth, tableController.getAvailableTables);

// Récupérer le statut des tables pour une date
router.get('/status/:date?', auth, tableController.getTableStatusByDate);

// Récupérer une table par ID
router.get('/:id', auth, tableController.getTableById);

// Créer une nouvelle table (admin uniquement)
router.post('/', auth, isAdmin, validateTable, tableController.createTable);

// Mettre à jour une table (admin uniquement)
router.put('/:id', auth, isAdmin, validateTable, tableController.updateTable);

// Supprimer une table (admin uniquement)
router.delete('/:id', auth, isAdmin, tableController.deleteTable);

// Mettre à jour le statut d'une table
router.patch('/:id/status', auth, tableController.updateTableStatus);

module.exports = router;
