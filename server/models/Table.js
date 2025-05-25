// server/models/Table.js
// Modèle pour les tables du restaurant - VERSION COMPLÈTE

const db = require('../config/db');

class Table {
  // Récupérer toutes les tables
  static async getAll() {
    try {
      const sql = 'SELECT * FROM tables ORDER BY number ASC';
      return await db.query(sql);
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  // Récupérer une table par ID
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM tables WHERE id = ?';
      const tables = await db.query(sql, [id]);
      
      if (tables.length === 0) {
        return null;
      }
      
      return tables[0];
    } catch (error) {
      console.error('Error fetching table by ID:', error);
      throw error;
    }
  }

  // Créer une nouvelle table
  static async create(tableData) {
    try {
      const { number, capacity, description } = tableData;
      
      const sql = `
        INSERT INTO tables (number, capacity, description)
        VALUES (?, ?, ?)
      `;
      
      const result = await db.query(sql, [number, capacity, description]);
      
      if (result.insertId) {
        return this.getById(result.insertId);
      }
      
      throw new Error('Failed to create table');
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  // Mettre à jour une table
  static async update(id, updateData) {
    try {
      // Construire la requête SQL dynamiquement
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No update data provided');
      }
      
      const sql = `
        UPDATE tables
        SET ${fields.map(field => `${field} = ?`).join(', ')}
        WHERE id = ?
      `;
      
      await db.query(sql, [...values, id]);
      
      return this.getById(id);
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une table
  static async updateStatus(id, status) {
    return this.update(id, { status });
  }

  // Récupérer les tables par capacité
  static async getByCapacity(capacity) {
    try {
      const sql = 'SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity ASC';
      return await db.query(sql, [capacity]);
    } catch (error) {
      console.error('Error fetching tables by capacity:', error);
      throw error;
    }
  }

  // Récupérer les tables disponibles pour une date, heure et taille de groupe
  static async getAvailable(date, time, partySize) {
    try {
      // Obtenir les tables qui pourraient convenir à la taille du groupe
      const potentialTables = await this.getByCapacity(partySize);
      
      if (potentialTables.length === 0) {
        return [];
      }
      
      // Pour chaque table, vérifier si elle est disponible à l'heure demandée
      const availableTables = [];
      
      for (const table of potentialTables) {
        // Vérifier si la table est réservée à cette heure
        const sql = `
          SELECT COUNT(*) as reservation_count
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
        
        // Durée standard de 2 heures pour une réservation
        const startTime = time;
        const endTime = new Date(`1970-01-01T${time}`);
        endTime.setHours(endTime.getHours() + 2);
        const endTimeStr = endTime.toTimeString().slice(0, 8);
        
        const result = await db.query(sql, [
          table.id,
          date,
          endTimeStr,
          startTime,
          startTime,
          endTimeStr
        ]);
        
        if (result[0].reservation_count === 0) {
          // La table est disponible
          availableTables.push(table);
        }
      }
      
      return availableTables;
    } catch (error) {
      console.error('Error fetching available tables:', error);
      throw error;
    }
  }

  // Récupérer les tables avec leur statut de réservation pour un jour spécifique
  static async getTableStatusByDate(date) {
    try {
      const sql = `
        SELECT t.*, 
               r.id as reservation_id, 
               r.time as reservation_time, 
               r.party_size, 
               r.customer_name,
               r.status as reservation_status
        FROM tables t
        LEFT JOIN (
          SELECT * FROM reservations 
          WHERE date = ? 
          AND status NOT IN ('cancelled', 'no_show')
        ) r ON t.id = r.table_id
        ORDER BY t.number ASC, r.time ASC
      `;
      
      return await db.query(sql, [date]);
    } catch (error) {
      console.error('Error fetching table status by date:', error);
      throw error;
    }
  }

  // Supprimer une table
  static async delete(id) {
    try {
      // Vérifier s'il y a des réservations futures liées à cette table
      const checkSql = `
        SELECT COUNT(*) as reservation_count
        FROM reservations
        WHERE table_id = ?
          AND date >= CURDATE()
          AND status NOT IN ('cancelled', 'no_show')
      `;
      
      const checkResult = await db.query(checkSql, [id]);
      
      if (checkResult[0].reservation_count > 0) {
        throw new Error('Cannot delete table with future reservations');
      }
      
      // Supprimer la table
      const sql = 'DELETE FROM tables WHERE id = ?';
      const result = await db.query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des tables
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_tables,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_tables,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_tables,
          SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved_tables,
          SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_tables,
          SUM(capacity) as total_capacity,
          AVG(capacity) as average_capacity,
          MIN(capacity) as min_capacity,
          MAX(capacity) as max_capacity
        FROM tables
      `;
      
      const result = await db.query(sql);
      return result[0];
    } catch (error) {
      console.error('Error fetching table stats:', error);
      throw error;
    }
  }

  // Récupérer les tables avec leurs réservations pour une période donnée
  static async getWithReservations(startDate, endDate) {
    try {
      const sql = `
        SELECT 
          t.*,
          COUNT(r.id) as reservation_count,
          GROUP_CONCAT(
            CONCAT(r.date, '|', r.time, '|', r.customer_name, '|', r.party_size, '|', r.status)
            ORDER BY r.date, r.time
            SEPARATOR ';'
          ) as reservations_data
        FROM tables t
        LEFT JOIN reservations r ON t.id = r.table_id 
          AND r.date BETWEEN ? AND ?
          AND r.status NOT IN ('cancelled', 'no_show')
        GROUP BY t.id
        ORDER BY t.number ASC
      `;
      
      const tables = await db.query(sql, [startDate, endDate]);
      
      // Traiter les données des réservations
      return tables.map(table => {
        const reservations = [];
        
        if (table.reservations_data) {
          const reservationsArray = table.reservations_data.split(';');
          reservationsArray.forEach(resData => {
            const [date, time, customer_name, party_size, status] = resData.split('|');
            reservations.push({
              date,
              time,
              customer_name,
              party_size: parseInt(party_size),
              status
            });
          });
        }
        
        return {
          ...table,
          reservations,
          reservations_data: undefined // Supprimer les données brutes
        };
      });
    } catch (error) {
      console.error('Error fetching tables with reservations:', error);
      throw error;
    }
  }

  // Récupérer l'occupation d'une table pour une date spécifique
  static async getOccupancyByDate(tableId, date) {
    try {
      const sql = `
        SELECT 
          r.*,
          ADDTIME(r.time, '02:00:00') as end_time
        FROM reservations r
        WHERE r.table_id = ?
          AND r.date = ?
          AND r.status NOT IN ('cancelled', 'no_show')
        ORDER BY r.time ASC
      `;
      
      return await db.query(sql, [tableId, date]);
    } catch (error) {
      console.error('Error fetching table occupancy:', error);
      throw error;
    }
  }

  // Vérifier si une table est disponible à un moment donné
  static async isAvailableAt(tableId, date, time, duration = 2) {
    try {
      const endTime = new Date(`1970-01-01T${time}`);
      endTime.setHours(endTime.getHours() + duration);
      const endTimeStr = endTime.toTimeString().slice(0, 8);

      const sql = `
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
      
      const result = await db.query(sql, [
        tableId, 
        date, 
        endTimeStr, 
        time, 
        time, 
        endTimeStr
      ]);
      
      return result[0].conflict_count === 0;
    } catch (error) {
      console.error('Error checking table availability:', error);
      throw error;
    }
  }

  // Obtenir le prochain créneau disponible pour une table
  static async getNextAvailableSlot(tableId, date) {
    try {
      // Récupérer toutes les réservations de la table pour cette date
      const reservations = await this.getOccupancyByDate(tableId, date);
      
      // Créneaux de service (à adapter selon vos horaires)
      const serviceSlots = [
        { start: '12:00:00', end: '15:00:00' }, // Déjeuner
        { start: '19:00:00', end: '23:00:00' }  // Dîner (si applicable)
      ];
      
      const availableSlots = [];
      
      for (const slot of serviceSlots) {
        let currentTime = slot.start;
        
        while (currentTime < slot.end) {
          const isAvailable = await this.isAvailableAt(tableId, date, currentTime);
          
          if (isAvailable) {
            availableSlots.push(currentTime);
          }
          
          // Incrémenter de 15 minutes
          const time = new Date(`1970-01-01T${currentTime}`);
          time.setMinutes(time.getMinutes() + 15);
          currentTime = time.toTimeString().slice(0, 8);
        }
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Error getting next available slot:', error);
      throw error;
    }
  }
}

module.exports = Table;