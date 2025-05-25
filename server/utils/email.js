// server/utils/email.js
// Utilitaire pour l'envoi d'emails

const nodemailer = require('nodemailer');
const config = require('../config/config');
const helpers = require('./helpers');

/**
 * Créer un transporteur pour l'envoi d'emails
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host || 'sandbox.smtp.mailtrap.io',
    port: config.email.port || 2525,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
};

/**
 * Envoyer un email
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.text - Contenu texte
 * @param {string} options.html - Contenu HTML (optionnel)
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendEmail = async (options) => {
  try {
    // Simuler un envoi d'email réussi
    console.log('==========================================');
    console.log('EMAIL SIMULÉ : ENVOI RÉUSSI');
    console.log('Destinataire :', options.to);
    console.log('Sujet :', options.subject);
    console.log('Contenu (début) :', options.text.substring(0, 100) + '...');
    console.log('==========================================');
    
    // Retourner un résultat simulé
    return { 
      accepted: [options.to],
      rejected: [],
      response: "250 Message accepted" 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Formater la date pour l'affichage
 * @param {string} dateString - Date au format ISO (YYYY-MM-DD)
 * @returns {string} - Date formatée (DD/MM/YYYY)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formater l'heure pour l'affichage
 * @param {string} timeString - Heure au format HH:MM:SS
 * @returns {string} - Heure formatée (HH:MM)
 */
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5);
};

/**
 * Obtenir le texte correspondant au statut d'une réservation
 * @param {string} status - Code du statut
 * @returns {string} - Texte du statut
 */
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'En attente de confirmation';
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
};

/**
 * Envoyer un email de confirmation de réservation
 * @param {Object} reservation - Données de la réservation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendReservationConfirmation = async (reservation) => {
  const subject = 'Confirmation de réservation - Restaurant Cazingue';
  
  // Contenu texte de l'email
  const textContent = `
Bonjour ${reservation.customer_name},

Nous vous remercions pour votre réservation au Restaurant Cazingue.

Voici les détails de votre réservation :
- Date : ${formatDate(reservation.date)}
- Heure : ${formatTime(reservation.time)}
- Nombre de personnes : ${reservation.party_size}
- Code de confirmation : ${reservation.confirmation_code}

Statut : ${getStatusText(reservation.status)}

${reservation.requires_approval ? 'Votre réservation est en attente de confirmation par notre équipe. Nous vous contacterons dès que possible pour confirmer votre réservation.' : ''}

Pour modifier ou annuler votre réservation, veuillez utiliser le lien suivant :
http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}

Nous sommes impatients de vous accueillir au Restaurant Cazingue.

Cordialement,
L'équipe du Restaurant Cazingue
67 Rue Chaptal, 92300 Levallois-Perret
Tél : 01 47 XX XX XX
`;

  // Contenu HTML de l'email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a6da7; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .info { margin: 20px 0; }
    .status { font-weight: bold; }
    .pending { color: #f39c12; }
    .confirmed { color: #2ecc71; }
    .cancel-link { margin: 20px 0; }
    a { color: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Restaurant Cazingue</h2>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.customer_name},</p>
      
      <p>Nous vous remercions pour votre réservation au Restaurant Cazingue.</p>
      
      <div class="info">
        <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
        <p><strong>Heure :</strong> ${formatTime(reservation.time)}</p>
        <p><strong>Nombre de personnes :</strong> ${reservation.party_size}</p>
        <p><strong>Code de confirmation :</strong> ${reservation.confirmation_code}</p>
        
        <p class="status ${reservation.status === 'confirmed' ? 'confirmed' : 'pending'}">
          <strong>Statut :</strong> ${getStatusText(reservation.status)}
        </p>
        
        ${reservation.requires_approval ? '<p>Votre réservation est en attente de confirmation par notre équipe. Nous vous contacterons dès que possible pour confirmer votre réservation.</p>' : ''}
      </div>
      
      <div class="cancel-link">
        <p>Pour modifier ou annuler votre réservation, <a href="http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}">cliquez ici</a>.</p>
      </div>
      
      <p>Nous sommes impatients de vous accueillir au Restaurant Cazingue.</p>
      
      <p>Cordialement,<br>
      L'équipe du Restaurant Cazingue</p>
    </div>
    <div class="footer">
      <p>Restaurant Cazingue - 67 Rue Chaptal, 92300 Levallois-Perret - Tél : 01 47 XX XX XX</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: reservation.customer_email,
    subject,
    text: textContent,
    html: htmlContent
  });
};

/**
 * Envoyer un email de confirmation de modification de réservation
 * @param {Object} reservation - Données de la réservation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendReservationUpdate = async (reservation) => {
  const subject = 'Modification de votre réservation - Restaurant Cazingue';
  
  // Contenu texte de l'email
  const textContent = `
Bonjour ${reservation.customer_name},

Votre réservation au Restaurant Cazingue a été modifiée avec succès.

Voici les nouveaux détails de votre réservation :
- Date : ${formatDate(reservation.date)}
- Heure : ${formatTime(reservation.time)}
- Nombre de personnes : ${reservation.party_size}
- Code de confirmation : ${reservation.confirmation_code}

Statut : ${getStatusText(reservation.status)}

${reservation.requires_approval ? 'Votre réservation modifiée est en attente de confirmation par notre équipe. Nous vous contacterons dès que possible pour confirmer votre réservation.' : ''}

Pour modifier à nouveau ou annuler votre réservation, veuillez utiliser le lien suivant :
http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}

Nous sommes impatients de vous accueillir au Restaurant Cazingue.

Cordialement,
L'équipe du Restaurant Cazingue
67 Rue Chaptal, 92300 Levallois-Perret
Tél : 01 47 XX XX XX
`;

  // Contenu HTML de l'email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a6da7; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .info { margin: 20px 0; }
    .status { font-weight: bold; }
    .pending { color: #f39c12; }
    .confirmed { color: #2ecc71; }
    .cancel-link { margin: 20px 0; }
    a { color: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Restaurant Cazingue</h2>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.customer_name},</p>
      
      <p>Votre réservation au Restaurant Cazingue a été modifiée avec succès.</p>
      
      <div class="info">
        <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
        <p><strong>Heure :</strong> ${formatTime(reservation.time)}</p>
        <p><strong>Nombre de personnes :</strong> ${reservation.party_size}</p>
        <p><strong>Code de confirmation :</strong> ${reservation.confirmation_code}</p>
        
        <p class="status ${reservation.status === 'confirmed' ? 'confirmed' : 'pending'}">
          <strong>Statut :</strong> ${getStatusText(reservation.status)}
        </p>
        
        ${reservation.requires_approval ? '<p>Votre réservation modifiée est en attente de confirmation par notre équipe. Nous vous contacterons dès que possible pour confirmer votre réservation.</p>' : ''}
      </div>
      
      <div class="cancel-link">
        <p>Pour modifier à nouveau ou annuler votre réservation, <a href="http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}">cliquez ici</a>.</p>
      </div>
      
      <p>Nous sommes impatients de vous accueillir au Restaurant Cazingue.</p>
      
      <p>Cordialement,<br>
      L'équipe du Restaurant Cazingue</p>
    </div>
    <div class="footer">
      <p>Restaurant Cazingue - 67 Rue Chaptal, 92300 Levallois-Perret - Tél : 01 47 XX XX XX</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: reservation.customer_email,
    subject,
    text: textContent,
    html: htmlContent
  });
};

/**
 * Envoyer un email d'annulation de réservation
 * @param {Object} reservation - Données de la réservation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendReservationCancellation = async (reservation) => {
  const subject = 'Annulation de votre réservation - Restaurant Cazingue';
  
  // Contenu texte de l'email
  const textContent = `
Bonjour ${reservation.customer_name},

Nous confirmons l'annulation de votre réservation au Restaurant Cazingue.

Réservation annulée :
- Date : ${formatDate(reservation.date)}
- Heure : ${formatTime(reservation.time)}
- Nombre de personnes : ${reservation.party_size}

Nous espérons avoir le plaisir de vous accueillir prochainement au Restaurant Cazingue.

Cordialement,
L'équipe du Restaurant Cazingue
67 Rue Chaptal, 92300 Levallois-Perret
Tél : 01 47 XX XX XX
`;

  // Contenu HTML de l'email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a6da7; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Restaurant Cazingue</h2>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.customer_name},</p>
      
      <p>Nous confirmons l'annulation de votre réservation au Restaurant Cazingue.</p>
      
      <div class="info">
        <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
        <p><strong>Heure :</strong> ${formatTime(reservation.time)}</p>
        <p><strong>Nombre de personnes :</strong> ${reservation.party_size}</p>
      </div>
      
      <p>Nous espérons avoir le plaisir de vous accueillir prochainement au Restaurant Cazingue.</p>
      
      <p>Cordialement,<br>
      L'équipe du Restaurant Cazingue</p>
    </div>
    <div class="footer">
      <p>Restaurant Cazingue - 67 Rue Chaptal, 92300 Levallois-Perret - Tél : 01 47 XX XX XX</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: reservation.customer_email,
    subject,
    text: textContent,
    html: htmlContent
  });
};

/**
 * Envoyer un email de notification au restaurant pour une nouvelle réservation
 * @param {Object} reservation - Données de la réservation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendNewReservationNotification = async (reservation) => {
  const subject = 'Nouvelle réservation - Restaurant Cazingue';
  
  // Contenu texte de l'email
  const textContent = `
Bonjour,

Une nouvelle réservation a été effectuée sur le site web du Restaurant Cazingue.

Détails de la réservation :
- Client : ${reservation.customer_name}
- Email : ${reservation.customer_email}
- Téléphone : ${reservation.customer_phone}
- Date : ${formatDate(reservation.date)}
- Heure : ${formatTime(reservation.time)}
- Nombre de personnes : ${reservation.party_size}
- Commentaires : ${reservation.comments || 'Aucun'}
- Code de confirmation : ${reservation.confirmation_code}

Cette réservation nécessite votre approbation. Veuillez vous connecter à l'interface d'administration pour la confirmer ou la rejeter.

Lien direct : http://www.cazingue.fr/admin/reservations/${reservation.id}

Cordialement,
Système de réservation BookMyTable
`;

  // Contenu HTML de l'email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a6da7; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .info { margin: 20px 0; }
    .actions { margin: 20px 0; text-align: center; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4a6da7; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Nouvelle Réservation</h2>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      
      <p>Une nouvelle réservation a été effectuée sur le site web du Restaurant Cazingue.</p>
      
      <div class="info">
        <p><strong>Client :</strong> ${reservation.customer_name}</p>
        <p><strong>Email :</strong> ${reservation.customer_email}</p>
        <p><strong>Téléphone :</strong> ${reservation.customer_phone}</p>
        <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
        <p><strong>Heure :</strong> ${formatTime(reservation.time)}</p>
        <p><strong>Nombre de personnes :</strong> ${reservation.party_size}</p>
        <p><strong>Commentaires :</strong> ${reservation.comments || 'Aucun'}</p>
        <p><strong>Code de confirmation :</strong> ${reservation.confirmation_code}</p>
      </div>
      
      <p>Cette réservation nécessite votre approbation.</p>
      
      <div class="actions">
        <a href="http://www.cazingue.fr/admin/reservations/${reservation.id}" class="button">Gérer cette réservation</a>
      </div>
      
      <p>Cordialement,<br>
      Système de réservation BookMyTable</p>
    </div>
    <div class="footer">
      <p>Restaurant Cazingue - 67 Rue Chaptal, 92300 Levallois-Perret</p>
    </div>
  </div>
</body>
</html>
`;

  // Envoyer l'email à l'adresse configurée pour les notifications
  return sendEmail({
    to: config.email.user, // Utiliser l'adresse email configurée
    subject,
    text: textContent,
    html: htmlContent
  });
};

/**
 * Envoyer un rappel pour une réservation à venir
 * @param {Object} reservation - Données de la réservation
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
const sendReservationReminder = async (reservation) => {
  const subject = 'Rappel de réservation - Restaurant Cazingue';
  
  // Contenu texte de l'email
  const textContent = `
Bonjour ${reservation.customer_name},

Nous vous rappelons votre réservation au Restaurant Cazingue prévue demain.

Détails de votre réservation :
- Date : ${formatDate(reservation.date)}
- Heure : ${formatTime(reservation.time)}
- Nombre de personnes : ${reservation.party_size}
- Code de confirmation : ${reservation.confirmation_code}

Si vous souhaitez modifier ou annuler votre réservation, veuillez utiliser le lien suivant :
http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}

Nous sommes impatients de vous accueillir au Restaurant Cazingue.

Cordialement,
L'équipe du Restaurant Cazingue
67 Rue Chaptal, 92300 Levallois-Perret
Tél : 01 47 XX XX XX
`;

  // Contenu HTML de l'email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a6da7; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    .info { margin: 20px 0; }
    .cancel-link { margin: 20px 0; }
    a { color: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Rappel de Réservation</h2>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.customer_name},</p>
      
      <p>Nous vous rappelons votre réservation au Restaurant Cazingue prévue demain.</p>
      
      <div class="info">
        <p><strong>Date :</strong> ${formatDate(reservation.date)}</p>
        <p><strong>Heure :</strong> ${formatTime(reservation.time)}</p>
        <p><strong>Nombre de personnes :</strong> ${reservation.party_size}</p>
        <p><strong>Code de confirmation :</strong> ${reservation.confirmation_code}</p>
      </div>
      
      <div class="cancel-link">
        <p>Si vous souhaitez modifier ou annuler votre réservation, <a href="http://www.cazingue.fr/reservations/manage/${reservation.confirmation_code}">cliquez ici</a>.</p>
      </div>
      
      <p>Nous sommes impatients de vous accueillir au Restaurant Cazingue.</p>
      
      <p>Cordialement,<br>
      L'équipe du Restaurant Cazingue</p>
    </div>
    <div class="footer">
      <p>Restaurant Cazingue - 67 Rue Chaptal, 92300 Levallois-Perret - Tél : 01 47 XX XX XX</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: reservation.customer_email,
    subject,
    text: textContent,
    html: htmlContent
  });
};

module.exports = {
  sendEmail,
  sendReservationConfirmation,
  sendReservationUpdate,
  sendReservationCancellation,
  sendNewReservationNotification,
  sendReservationReminder
};