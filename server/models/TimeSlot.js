// server/models/TimeSlot.js
// Modèle pour les créneaux horaires de réservation

const db = require('../config/db');
const Reservation = require('./Reservation');

class TimeSlot {
  // Récupérer tous les créneaux horaires
  static async getAll() {
    try {
      const sql = 'SELECT * FROM time_slots ORDER BY start_time ASC';
      return await db.query(sql);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  }

  // Récupérer les créneaux horaires pour le déjeuner
  static async getLunchSlots() {
    try {
      const sql = 'SELECT * FROM time_slots WHERE is_lunch = TRUE ORDER BY start_time ASC';
      return await db.query(sql);
    } catch (error) {
      console.error('Error fetching lunch time slots:', error);
      throw error;
    }
  }

  // Récupérer les créneaux horaires pour le dîner
  static async getDinnerSlots() {
    try {
      const sql = 'SELECT * FROM time_slots WHERE is_dinner = TRUE ORDER BY start_time ASC';
      return await db.query(sql);
    } catch (error) {
      console.error('Error fetching dinner time slots:', error);
      throw error;
    }
  }

  // Vérifier la disponibilité des créneaux pour une date donnée
  static async getAvailability(date, partySize) {
    try {
      // Récupérer tous les créneaux horaires
      const timeSlots = await this.getAll();
      
      // Récupérer toutes les réservations pour cette date
      const reservations = await Reservation.getByDate(date);
      
      // Vérifier si la date tombe un jeudi (jour 4 de la semaine)
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const isThursday = dayOfWeek === 4; // Jeudi correspond à l'index 4
      
      // Vérifier si la date tombe un samedi ou un dimanche (jours 6 et 0)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = dimanche, 6 = samedi
      
      // Calculer la disponibilité pour chaque créneau
      const availability = [];
      
      for (const slot of timeSlots) {
        // Si c'est le weekend, le restaurant est fermé
        if (isWeekend) {
          availability.push({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_lunch: slot.is_lunch,
            is_dinner: slot.is_dinner,
            available: false
          });
          continue;
        }
        
        // Si c'est un dîner et que ce n'est pas jeudi, le créneau n'est pas disponible
        if (slot.is_dinner && !isThursday) {
          availability.push({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_lunch: slot.is_lunch,
            is_dinner: slot.is_dinner,
            available: false
          });
          continue;
        }
        
        // Pour les déjeuners (tous les jours de la semaine) et les dîners (uniquement le jeudi),
        // nous vérifions s'il y a une table disponible
        let isAvailable = true;
        
        // Pour les déjeuners ou les dîners le jeudi, vérifier la disponibilité
        if ((slot.is_lunch && !isWeekend) || (slot.is_dinner && isThursday)) {
          // Récupérer les tables qui peuvent accueillir ce groupe
          const sql = 'SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity ASC';
          const tables = await db.query(sql, [partySize]);
          
          // Vérifier s'il y a au moins une table qui n'a pas de réservation conflictuelle
          isAvailable = false; // Supposer qu'aucune table n'est disponible
          
          for (const table of tables) {
            // Vérifier s'il y a des réservations qui chevauchent ce créneau pour cette table
            const conflictingReservations = reservations.filter(res => {
              // Ignorer les réservations annulées ou no-show
              if (res.status === 'cancelled' || res.status === 'no_show') {
                return false;
              }
              
              // Ignorer les réservations qui ne sont pas pour cette table
              if (res.table_id !== table.id) {
                return false;
              }
              
              // Vérifier le chevauchement des horaires
              const resStartTime = res.time;
              const resEndHour = parseInt(resStartTime.split(':')[0]) + 2; // +2h pour la durée moyenne
              const resEndMinutes = resStartTime.split(':')[1];
              const resEndTimeStr = `${resEndHour.toString().padStart(2, '0')}:${resEndMinutes}:00`;
              
              return (
                (slot.start_time <= resEndTimeStr && slot.end_time > resStartTime) ||
                (slot.start_time < resEndTimeStr && slot.end_time >= resStartTime)
              );
            });
            
            // Si aucune réservation conflictuelle pour cette table, elle est disponible
            if (conflictingReservations.length === 0) {
              isAvailable = true;
              break; // Une table disponible suffit
            }
          }
        }
        
        // Forcer la disponibilité des créneaux de dîner le jeudi
        // C'est la correction principale pour s'assurer que les créneaux de dîner sont disponibles le jeudi
        if (slot.is_dinner && isThursday) {
          isAvailable = true;
        }
        
        availability.push({
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_lunch: slot.is_lunch,
          is_dinner: slot.is_dinner,
          available: isAvailable
        });
      }
      
      return availability;
    } catch (error) {
      console.error('Error getting time slot availability:', error);
      throw error;
    }
  }

  // Créer un nouveau créneau horaire
  static async create(slotData) {
    try {
      const { start_time, end_time, is_lunch, is_dinner } = slotData;
      
      const sql = `
        INSERT INTO time_slots (start_time, end_time, is_lunch, is_dinner)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await db.query(sql, [start_time, end_time, is_lunch, is_dinner]);
      
      if (result.insertId) {
        // Récupérer le créneau créé
        const slots = await db.query('SELECT * FROM time_slots WHERE id = ?', [result.insertId]);
        return slots[0];
      }
      
      throw new Error('Failed to create time slot');
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }
  }

  // Mettre à jour un créneau horaire
  static async update(id, updateData) {
    try {
      // Construire la requête SQL dynamiquement
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No update data provided');
      }
      
      const sql = `
        UPDATE time_slots
        SET ${fields.map(field => `${field} = ?`).join(', ')}
        WHERE id = ?
      `;
      
      await db.query(sql, [...values, id]);
      
      // Récupérer le créneau mis à jour
      const slots = await db.query('SELECT * FROM time_slots WHERE id = ?', [id]);
      
      if (slots.length === 0) {
        throw new Error('Time slot not found');
      }
      
      return slots[0];
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }
  }

  // Supprimer un créneau horaire
  static async delete(id) {
    try {
      const sql = 'DELETE FROM time_slots WHERE id = ?';
      const result = await db.query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  }
}

module.exports = TimeSlot;