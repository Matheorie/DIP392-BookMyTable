// server/utils/helpers.js
// Fonctions utilitaires pour l'application

/**
 * Générer un code de confirmation aléatoire
 * @param {number} length - Longueur du code (défaut: 8)
 * @returns {string} - Code de confirmation
 */
function generateConfirmationCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Vérifier si une date est valide et dans le futur
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {boolean} - True si la date est valide et dans le futur
 */
function isValidFutureDate(dateString) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure
  
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure
  
  // Vérifier si la date est valide
  if (isNaN(inputDate.getTime())) {
    return false;
  }
  
  // Vérifier si la date est dans le futur ou aujourd'hui
  return inputDate >= currentDate;
}

/**
 * Vérifier si une heure est valide
 * @param {string} timeString - Heure au format HH:MM ou HH:MM:SS
 * @returns {boolean} - True si l'heure est valide
 */
function isValidTime(timeString) {
  // Regex pour vérifier le format HH:MM ou HH:MM:SS
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
  return timeRegex.test(timeString);
}

/**
 * Vérifier si une date et une heure sont dans le futur
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @param {string} timeString - Heure au format HH:MM ou HH:MM:SS
 * @returns {boolean} - True si la date et l'heure sont dans le futur
 */
function isInFuture(dateString, timeString) {
  const now = new Date();
  
  const [hours, minutes] = timeString.split(':');
  const future = new Date(dateString);
  future.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return future > now;
}

/**
 * Calculer la différence en heures entre maintenant et une date/heure future
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @param {string} timeString - Heure au format HH:MM ou HH:MM:SS
 * @returns {number} - Différence en heures (nombre décimal)
 */
function getHoursDifference(dateString, timeString) {
  const now = new Date();
  
  const [hours, minutes] = timeString.split(':');
  const future = new Date(dateString);
  future.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const diffMs = future - now;
  return diffMs / (1000 * 60 * 60); // Convertir en heures
}

/**
 * Formater une date pour l'affichage
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format de sortie (défaut: 'DD/MM/YYYY')
 * @returns {string} - Date formatée
 */
function formatDate(date, format = 'DD/MM/YYYY') {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  let formattedDate = format;
  formattedDate = formattedDate.replace('DD', day);
  formattedDate = formattedDate.replace('MM', month);
  formattedDate = formattedDate.replace('YYYY', year);
  
  return formattedDate;
}

/**
 * Formater une heure pour l'affichage
 * @param {string} time - Heure à formater (HH:MM:SS)
 * @returns {string} - Heure formatée (HH:MM)
 */
function formatTime(time) {
  if (!time) return '';
  
  // Si c'est déjà au format HH:MM, le retourner tel quel
  if (time.length === 5) {
    return time;
  }
  
  // Sinon, supposer que c'est au format HH:MM:SS et extraire HH:MM
  return time.substring(0, 5);
}

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valider un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} - True si le numéro est valide
 */
function isValidPhone(phone) {
  // Accepter les formats: +33612345678, 0612345678, 06 12 34 56 78, etc.
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitiser un texte (supprimer les balises HTML)
 * @param {string} text - Texte à sanitiser
 * @returns {string} - Texte sanitisé
 */
function sanitizeText(text) {
  if (!text) return '';
  
  // Supprimer les balises HTML
  return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Tronquer un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} length - Longueur maximale
 * @returns {string} - Texte tronqué
 */
function truncateText(text, length = 100) {
  if (!text) return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length) + '...';
}

/**
 * Convertir une chaîne en slug (URL-friendly)
 * @param {string} text - Texte à convertir
 * @returns {string} - Slug
 */
function slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Supprimer les caractères non alphanumériques
    .replace(/--+/g, '-'); // Éviter les tirets multiples
}

/**
 * Obtenir le statut d'une réservation en texte
 * @param {string} status - Code de statut
 * @returns {string} - Texte du statut
 */
function getReservationStatusText(status) {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmée';
    case 'cancelled':
      return 'Annulée';
    case 'completed':
      return 'Terminée';
    case 'no_show':
      return 'Absence';
    default:
      return status;
  }
}

/**
 * Obtenir la classe CSS pour un statut de réservation
 * @param {string} status - Code de statut
 * @returns {string} - Classe CSS
 */
function getReservationStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'completed':
      return 'info';
    case 'no_show':
      return 'dark';
    default:
      return 'secondary';
  }
}

module.exports = {
  generateConfirmationCode,
  isValidFutureDate,
  isValidTime,
  isInFuture,
  getHoursDifference,
  formatDate,
  formatTime,
  isValidEmail,
  isValidPhone,
  sanitizeText,
  truncateText,
  slugify,
  getReservationStatusText,
  getReservationStatusClass
};
