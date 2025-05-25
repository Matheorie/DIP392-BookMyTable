// server/models/Reservation.js
// Modèle pour les réservations

const db = require('../config/db');
const { generateConfirmationCode } = require('../utils/helpers');

class Reservation {
  // Créer une nouvelle réservation
  static async create(reservationData) {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      date, 
      time, 
      party_size, 
      comments 
    } = reservationData;

    // Générer un code de confirmation unique
    const confirmation_code = generateConfirmationCode();
    
    // Déterminer si la réservation nécessite une approbation
    const requires_approval = true; // Toujours nécessiter l'approbation du gérant

    try {
      const sql = `
        INSERT INTO reservations 
        (customer_name, customer_email, customer_phone, date, time, party_size, 
         comments, confirmation_code, requires_approval)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await db.query(sql, [
        customer_name, 
        customer_email, 
        customer_phone, 
        date, 
        time, 
        party_size, 
        comments, 
        confirmation_code,
        requires_approval
      ]);

      // Récupérer la réservation créée
      if (result.insertId) {
        return this.getById(result.insertId);
      }
      
      throw new Error('Failed to create reservation');
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  // Récupérer une réservation par ID
  static async getById(id) {
    try {
      const sql = `
        SELECT r.*, t.number as table_number, t.capacity as table_capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.id = ?
      `;
      
      const reservations = await db.query(sql, [id]);
      
      if (reservations.length === 0) {
        return null;
      }
      
      return reservations[0];
    } catch (error) {
      console.error('Error fetching reservation by ID:', error);
      throw error;
    }
  }

  // Récupérer une réservation par code de confirmation
  static async getByConfirmationCode(code) {
    try {
      const sql = `
        SELECT r.*, t.number as table_number, t.capacity as table_capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.confirmation_code = ?
      `;
      
      const reservations = await db.query(sql, [code]);
      
      if (reservations.length === 0) {
        return null;
      }
      
      return reservations[0];
    } catch (error) {
      console.error('Error fetching reservation by confirmation code:', error);
      throw error;
    }
  }

  // Mettre à jour une réservation
  static async update(id, updateData) {
    try {
      // Construire la requête SQL dynamiquement
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No update data provided');
      }
      
      const sql = `
        UPDATE reservations
        SET ${fields.map(field => `${field} = ?`).join(', ')}
        WHERE id = ?
      `;
      
      await db.query(sql, [...values, id]);
      
      return this.getById(id);
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  // Supprimer une réservation
  static async delete(id) {
    try {
      const sql = 'DELETE FROM reservations WHERE id = ?';
      const result = await db.query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  // Récupérer toutes les réservations pour une date spécifique
  static async getByDate(date) {
    try {
      const sql = `
        SELECT r.*, t.number as table_number, t.capacity as table_capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.date = ?
        ORDER BY r.time ASC
      `;
      
      return await db.query(sql, [date]);
    } catch (error) {
      console.error('Error fetching reservations by date:', error);
      throw error;
    }
  }

  // Vérifier si une table est disponible à une date et heure données
  static async checkTableAvailability(tableId, date, time, duration, excludeReservationId = null) {
    try {
      // Convertir l'heure de début et calculer l'heure de fin
      const startTime = new Date(`1970-01-01T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
      const endTimeStr = endTime.toTimeString().slice(0, 8);

      let sql = `
        SELECT COUNT(*) as conflict_count
        FROM reservations
        WHERE table_id = ?
          AND date = ?
          AND status NOT IN ('cancelled', 'no_show')
          AND (
            (time <= ? AND ADDTIME(time, '02:00:00') > ?)
            OR
            (time < ? AND ADDTIME(time, '02:00:00') >= ?)
          )
      `;
      
      let params = [tableId, date, endTimeStr, time, time, endTimeStr];
      
      // Si on exclut une réservation spécifique (pour les mises à jour)
      if (excludeReservationId) {
        sql += ' AND id != ?';
        params.push(excludeReservationId);
      }
      
      const result = await db.query(sql, params);
      
      // Retourne true si aucun conflit n'est trouvé
      return result[0].conflict_count === 0;
    } catch (error) {
      console.error('Error checking table availability:', error);
      throw error;
    }
  }

  // Trouver une table disponible pour une réservation
  static async findAvailableTable(date, time, partySize) {
    try {
      // Durée standard de 2 heures pour une réservation
      const duration = 2;
      
      // Obtenir toutes les tables qui peuvent accueillir le groupe
      const sql = `
        SELECT id, number, capacity
        FROM tables
        WHERE capacity >= ?
        ORDER BY capacity ASC
      `;
      
      const tables = await db.query(sql, [partySize]);
      
      // Vérifier la disponibilité de chaque table
      for (const table of tables) {
        const isAvailable = await this.checkTableAvailability(table.id, date, time, duration);
        
        if (isAvailable) {
          return table;
        }
      }
      
      // Aucune table disponible
      return null;
    } catch (error) {
      console.error('Error finding available table:', error);
      throw error;
    }
  }

  // Approuver une réservation et assigner une table
  static async approve(id) {
    try {
      const reservation = await this.getById(id);
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      
      // Trouver une table disponible
      const availableTable = await this.findAvailableTable(
        reservation.date,
        reservation.time,
        reservation.party_size
      );
      
      if (!availableTable) {
        throw new Error('No available table for this reservation');
      }
      
      // Mettre à jour la réservation
      const updateData = {
        status: 'confirmed',
        table_id: availableTable.id
      };
      
      return this.update(id, updateData);
    } catch (error) {
      console.error('Error approving reservation:', error);
      throw error;
    }
  }

  // Rechercher des réservations (pour l'admin)
  static async search(filters = {}) {
    try {
      let sql = `
        SELECT r.*, t.number as table_number, t.capacity as table_capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Ajouter les filtres à la requête
      if (filters.date) {
        sql += ' AND r.date = ?';
        params.push(filters.date);
      }
      
      if (filters.status) {
        sql += ' AND r.status = ?';
        params.push(filters.status);
      }
      
      if (filters.customer_name) {
        sql += ' AND r.customer_name LIKE ?';
        params.push(`%${filters.customer_name}%`);
      }
      
      if (filters.customer_email) {
        sql += ' AND r.customer_email LIKE ?';
        params.push(`%${filters.customer_email}%`);
      }
      
      // Tri
      sql += ' ORDER BY r.date ASC, r.time ASC';
      
      return await db.query(sql, params);
    } catch (error) {
      console.error('Error searching reservations:', error);
      throw error;
    }
  }
}

module.exports = Reservation;
