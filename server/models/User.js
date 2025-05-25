// server/models/User.js
// Modèle pour les utilisateurs (administrateurs et personnel)

const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Récupérer un utilisateur par son nom d'utilisateur
  static async getByUsername(username) {
    try {
      const sql = 'SELECT * FROM users WHERE username = ?';
      const users = await db.query(sql, [username]);
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par son ID
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const users = await db.query(sql, [id]);
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async create(userData) {
    try {
      const { username, password, email, role } = userData;
      
      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const sql = `
        INSERT INTO users (username, password, email, role)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await db.query(sql, [username, hashedPassword, email, role || 'staff']);
      
      if (result.insertId) {
        // Récupérer l'utilisateur créé (sans le mot de passe)
        const user = await this.getById(result.insertId);
        delete user.password;
        return user;
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    try {
      // Si le mot de passe est mis à jour, le hasher
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
      // Construire la requête SQL dynamiquement
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No update data provided');
      }
      
      const sql = `
        UPDATE users
        SET ${fields.map(field => `${field} = ?`).join(', ')}
        WHERE id = ?
      `;
      
      await db.query(sql, [...values, id]);
      
      // Récupérer l'utilisateur mis à jour (sans le mot de passe)
      const user = await this.getById(id);
      delete user.password;
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async delete(id) {
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = await db.query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Récupérer tous les utilisateurs
  static async getAll() {
    try {
      const sql = 'SELECT id, username, email, role, created_at FROM users';
      return await db.query(sql);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // Vérifier les identifiants d'un utilisateur
  static async verifyCredentials(username, password) {
    try {
      // Récupérer l'utilisateur avec son mot de passe haché
      const sql = 'SELECT * FROM users WHERE username = ?';
      const users = await db.query(sql, [username]);
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return null;
      }
      
      // Retourner l'utilisateur sans le mot de passe
      delete user.password;
      return user;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  }
}

module.exports = User;
