const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Get user by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // Get user by email
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    const [user] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    return user[0];
  }

  // Update user
  static async update(id, userData) {
    const { name, email, role } = userData;
    
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    
    const [user] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    return user[0];
  }

  // Delete user
  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return { id };
  }

  // Get all users
  static async findAll() {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users');
    return rows;
  }

  // Validate password
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;