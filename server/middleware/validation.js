// server/middleware/validation.js
// Middleware de validation des requêtes

const helpers = require('../utils/helpers');
const config = require('../config/config');

/**
 * Valider les données de réservation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateReservation(req, res, next) {
  const { 
    customer_name, 
    customer_email, 
    customer_phone, 
    date, 
    time, 
    party_size,
    comments 
  } = req.body;

  const errors = [];

  // Valider le nom du client
  if (!customer_name || customer_name.trim().length < 2) {
    errors.push('Le nom du client est requis et doit contenir au moins 2 caractères.');
  }

  // Valider l'email du client
  if (!customer_email || !helpers.isValidEmail(customer_email)) {
    errors.push('Une adresse email valide est requise.');
  }

  // Valider le téléphone du client
  if (!customer_phone || !helpers.isValidPhone(customer_phone)) {
    errors.push('Un numéro de téléphone valide est requis.');
  }

  // Valider la date
  if (!date || !helpers.isValidFutureDate(date)) {
    errors.push('Une date valide dans le futur est requise.');
  }

  // Valider l'heure
  if (!time || !helpers.isValidTime(time)) {
    errors.push('Une heure valide est requise.');
  }

  // Vérifier que la date n'est pas un week-end (samedi ou dimanche)
  if (date) {
    const dayOfWeek = new Date(date).getDay(); // 0 = dimanche, 6 = samedi
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      errors.push('Le restaurant est fermé le week-end. Veuillez choisir un jour de la semaine (lundi à vendredi).');
    }
  }

  // Vérifier que le dîner est choisi uniquement le jeudi
  if (date && time) {
    const dayOfWeek = new Date(date).getDay();
    const isThursday = dayOfWeek === 4;
    const hour = parseInt(time.split(':')[0], 10);

    // Considérer qu'après 15h, c'est le service du dîner
    if (hour >= 15 && !isThursday) {
      errors.push('Le service du dîner n\'est disponible que le jeudi. Veuillez choisir un jeudi pour le dîner ou un horaire de déjeuner (avant 15h) pour les autres jours.');
    }
  }

  // Valider que la date et l'heure sont dans le futur
  if (date && time && !helpers.isInFuture(date, time)) {
    errors.push('La date et l\'heure de réservation doivent être dans le futur.');
  }

  // Valider le délai minimum pour réserver
  if (date && time) {
    const hoursDifference = helpers.getHoursDifference(date, time);
    if (hoursDifference < config.reservation.minAdvanceTime) {
      errors.push(`Les réservations doivent être effectuées au moins ${config.reservation.minAdvanceTime} heure(s) à l'avance.`);
    }
    if (hoursDifference > config.reservation.maxAdvanceTime) {
      errors.push(`Les réservations ne peuvent pas être effectuées plus de ${config.reservation.maxAdvanceTime / 24} jour(s) à l'avance.`);
    }
  }

  // Valider le nombre de personnes
  if (!party_size || isNaN(party_size) || party_size < 1 || party_size > 20) {
    errors.push('Le nombre de personnes doit être compris entre 1 et 20.');
  }

  // Valider les commentaires (optionnels)
  if (comments && comments.length > 500) {
    errors.push('Les commentaires ne doivent pas dépasser 500 caractères.');
  }

  // Vérifier s'il y a des erreurs
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors
    });
  }

  // Sanitiser les données
  req.body.customer_name = helpers.sanitizeText(customer_name.trim());
  req.body.customer_email = customer_email.trim().toLowerCase();
  req.body.customer_phone = customer_phone.trim();
  req.body.comments = comments ? helpers.sanitizeText(comments.trim()) : '';

  next();
}

/**
 * Valider les données de mise à jour de réservation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateReservationUpdate(req, res, next) {
  const { 
    customer_name, 
    customer_email, 
    customer_phone, 
    date, 
    time, 
    party_size,
    comments,
    status
  } = req.body;

  const errors = [];

  // Valider le nom du client (si fourni)
  if (customer_name !== undefined && (customer_name.trim().length < 2)) {
    errors.push('Le nom du client doit contenir au moins 2 caractères.');
  }

  // Valider l'email du client (si fourni)
  if (customer_email !== undefined && !helpers.isValidEmail(customer_email)) {
    errors.push('Une adresse email valide est requise.');
  }

  // Valider le téléphone du client (si fourni)
  if (customer_phone !== undefined && !helpers.isValidPhone(customer_phone)) {
    errors.push('Un numéro de téléphone valide est requis.');
  }

  // Valider la date (si fournie)
  if (date !== undefined && !helpers.isValidFutureDate(date)) {
    errors.push('Une date valide dans le futur est requise.');
  }

  // Vérifier que la date n'est pas un week-end (samedi ou dimanche)
  if (date) {
    const dayOfWeek = new Date(date).getDay(); // 0 = dimanche, 6 = samedi
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      errors.push('Le restaurant est fermé le week-end. Veuillez choisir un jour de la semaine (lundi à vendredi).');
    }
  }

  // Valider l'heure (si fournie)
  if (time !== undefined && !helpers.isValidTime(time)) {
    errors.push('Une heure valide est requise.');
  }

  // Vérifier que le dîner est choisi uniquement le jeudi
  if (date && time) {
    const dayOfWeek = new Date(date).getDay();
    const isThursday = dayOfWeek === 4;
    const hour = parseInt(time.split(':')[0], 10);

    // Considérer qu'après 15h, c'est le service du dîner
    if (hour >= 15 && !isThursday) {
      errors.push('Le service du dîner n\'est disponible que le jeudi. Veuillez choisir un jeudi pour le dîner ou un horaire de déjeuner (avant 15h) pour les autres jours.');
    }
  }

  // Valider que la date et l'heure sont dans le futur (si les deux sont fournies)
  if (date !== undefined && time !== undefined && !helpers.isInFuture(date, time)) {
    errors.push('La date et l\'heure de réservation doivent être dans le futur.');
  }

  // Valider le délai minimum pour modifier la réservation
  if (date !== undefined && time !== undefined) {
    const hoursDifference = helpers.getHoursDifference(date, time);
    if (hoursDifference < config.reservation.minAdvanceTime) {
      errors.push(`Les modifications doivent être effectuées au moins ${config.reservation.minAdvanceTime} heure(s) à l'avance.`);
    }
    if (hoursDifference > config.reservation.maxAdvanceTime) {
      errors.push(`Les réservations ne peuvent pas être modifiées pour une date plus de ${config.reservation.maxAdvanceTime / 24} jour(s) à l'avance.`);
    }
  }

  // Valider le nombre de personnes (si fourni)
  if (party_size !== undefined && (isNaN(party_size) || party_size < 1 || party_size > 20)) {
    errors.push('Le nombre de personnes doit être compris entre 1 et 20.');
  }

  // Valider les commentaires (si fournis)
  if (comments !== undefined && comments.length > 500) {
    errors.push('Les commentaires ne doivent pas dépasser 500 caractères.');
  }

  // Valider le statut (si fourni)
  if (status !== undefined) {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      errors.push('Statut de réservation invalide.');
    }
  }

  // Vérifier s'il y a des erreurs
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors
    });
  }

  // Sanitiser les données
  if (customer_name !== undefined) {
    req.body.customer_name = helpers.sanitizeText(customer_name.trim());
  }
  if (customer_email !== undefined) {
    req.body.customer_email = customer_email.trim().toLowerCase();
  }
  if (customer_phone !== undefined) {
    req.body.customer_phone = customer_phone.trim();
  }
  if (comments !== undefined) {
    req.body.comments = helpers.sanitizeText(comments.trim());
  }

  next();
}

/**
 * Valider les données d'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Le nom d\'utilisateur et le mot de passe sont requis.'
    });
  }

  next();
}

/**
 * Valider les données de création d'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateUser(req, res, next) {
  const { username, password, email, role } = req.body;

  const errors = [];

  // Valider le nom d'utilisateur
  if (!username || username.trim().length < 3) {
    errors.push('Le nom d\'utilisateur est requis et doit contenir au moins 3 caractères.');
  }

  // Valider le mot de passe
  if (!password || password.length < 8) {
    errors.push('Le mot de passe est requis et doit contenir au moins 8 caractères.');
  }

  // Critères de complexité du mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (password && !passwordRegex.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.');
  }

  // Valider l'email
  if (!email || !helpers.isValidEmail(email)) {
    errors.push('Une adresse email valide est requise.');
  }

  // Valider le rôle
  if (role && !['admin', 'staff'].includes(role)) {
    errors.push('Le rôle doit être "admin" ou "staff".');
  }

  // Vérifier s'il y a des erreurs
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors
    });
  }

  // Sanitiser les données
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

/**
 * Valider les données de table
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateTable(req, res, next) {
  const { number, capacity, description } = req.body;

  const errors = [];

  // Valider le numéro de table
  if (!number || isNaN(number) || number < 1) {
    errors.push('Un numéro de table valide est requis.');
  }

  // Valider la capacité
  if (!capacity || isNaN(capacity) || capacity < 1 || capacity > 20) {
    errors.push('La capacité doit être comprise entre 1 et 20 personnes.');
  }

  // Valider la description (optionnelle)
  if (description && description.length > 255) {
    errors.push('La description ne doit pas dépasser 255 caractères.');
  }

  // Vérifier s'il y a des erreurs
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors
    });
  }

  // Sanitiser les données
  req.body.number = parseInt(number);
  req.body.capacity = parseInt(capacity);
  req.body.description = description ? helpers.sanitizeText(description.trim()) : '';

  next();
}

/**
 * Valider l'ID de confirmation d'une réservation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateConfirmationCode(req, res, next) {
  const { code } = req.params;

  if (!code || code.length !== 8) {
    return res.status(400).json({
      success: false,
      message: 'Code de confirmation invalide.'
    });
  }

  next();
}

/**
 * Valider les données de créneau horaire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function validateTimeSlot(req, res, next) {
  const { start_time, end_time, is_lunch, is_dinner } = req.body;

  const errors = [];

  // Valider l'heure de début
  if (!start_time || !helpers.isValidTime(start_time)) {
    errors.push('Une heure de début valide est requise.');
  }

  // Valider l'heure de fin
  if (!end_time || !helpers.isValidTime(end_time)) {
    errors.push('Une heure de fin valide est requise.');
  }

  // Vérifier que l'heure de début est antérieure à l'heure de fin
  if (start_time && end_time && start_time >= end_time) {
    errors.push('L\'heure de début doit être antérieure à l\'heure de fin.');
  }

  // Valider le type de créneau (déjeuner ou dîner)
  if (is_lunch === undefined && is_dinner === undefined) {
    errors.push('Veuillez spécifier s\'il s\'agit d\'un créneau de déjeuner ou de dîner.');
  }

  // Vérifier s'il y a des erreurs
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors
    });
  }

  next();
}

module.exports = {
  validateReservation,
  validateReservationUpdate,
  validateLogin,
  validateUser,
  validateTable,
  validateConfirmationCode,
  validateTimeSlot
};