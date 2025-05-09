const db = require('../config/db');

class Part {
  // Helper to transform snake_case to camelCase for frontend
  static transformToCamelCase(part) {
    if (!part) return null;
    
    return {
      _id: part.id,
      partNumber: part.part_number,
      name: part.name,
      description: part.description,
      category: part.category,
      quantity: part.quantity,
      price: part.price,
      minStockLevel: part.low_stock_threshold,
      manufacturer: part.manufacturer,
      location: part.location,
      unit: part.unit,
      createdAt: part.created_at,
      updatedAt: part.updated_at
    };
  }
  
  // Helper to transform array of parts
  static transformArrayToCamelCase(parts) {
    return parts.map(part => this.transformToCamelCase(part));
  }

  // Get all parts
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM parts';
    const params = [];
    const conditions = [];

    // Apply filters
    if (filters.search) {
      // Improved search to include manufacturer and description
      conditions.push('(part_number LIKE ? OR name LIKE ? OR category LIKE ? OR manufacturer LIKE ? OR description LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (filters.lowStock) {
      conditions.push('quantity <= low_stock_threshold');
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    if (filters.sortBy) {
      // Map frontend field names to database column names
      const fieldMapping = {
        'partNumber': 'part_number',
        'name': 'name',
        'quantity': 'quantity',
        'category': 'category',
        'price': 'price',
        'createdAt': 'created_at',
        'manufacturer': 'manufacturer'
      };
      
      // Use mapped field or default to created_at
      const sortField = fieldMapping[filters.sortBy] || 'created_at';
      const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // For debugging
    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    const [rows] = await db.query(query, params);
    return this.transformArrayToCamelCase(rows);
  }

  // Get part by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM parts WHERE id = ?', [id]);
    return this.transformToCamelCase(rows[0]);
  }

  // Get part by part number
  static async findByPartNumber(partNumber) {
    const [rows] = await db.query('SELECT * FROM parts WHERE part_number = ?', [partNumber]);
    return this.transformToCamelCase(rows[0]);
  }

  // Create a new part
  static async create(partData) {
    // Transform camelCase to snake_case for database
    const { 
      partNumber, 
      name, 
      description = null, 
      category = null, 
      quantity = 0, 
      price = null, 
      minStockLevel = 10,
      manufacturer = null,
      location = null,
      unit = 'pcs'
    } = partData;

    const [result] = await db.query(
      'INSERT INTO parts (part_number, name, description, category, quantity, price, low_stock_threshold, manufacturer, location, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [partNumber, name, description, category, quantity, price, minStockLevel, manufacturer, location, unit]
    );

    return this.findById(result.insertId);
  }

  // Update a part
  static async update(id, partData) {
    // Transform camelCase to snake_case for database
    const { 
      partNumber, 
      name, 
      description, 
      category, 
      quantity, 
      price, 
      minStockLevel,
      manufacturer,
      location,
      unit
    } = partData;

    await db.query(
      'UPDATE parts SET part_number = ?, name = ?, description = ?, category = ?, quantity = ?, price = ?, low_stock_threshold = ?, manufacturer = ?, location = ?, unit = ? WHERE id = ?',
      [partNumber, name, description, category, quantity, price, minStockLevel, manufacturer, location, unit, id]
    );

    return this.findById(id);
  }

  // Delete a part
  static async delete(id) {
    await db.query('DELETE FROM parts WHERE id = ?', [id]);
    return { _id: id };
  }

  // Update stock quantity
  static async updateStock(id, quantityChange, userId, notes = null, movementType = 'adjustment') {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current part
      const [parts] = await connection.query('SELECT * FROM parts WHERE id = ?', [id]);
      if (!parts.length) {
        throw new Error('Part not found');
      }
      
      const part = parts[0];
      const newQuantity = part.quantity + quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Cannot reduce quantity below zero');
      }
      
      // Update part quantity
      await connection.query(
        'UPDATE parts SET quantity = ? WHERE id = ?',
        [newQuantity, id]
      );
      
      // Record stock movement
      await connection.query(
        'INSERT INTO stock_movements (part_id, quantity_change, movement_type, notes, user_id) VALUES (?, ?, ?, ?, ?)',
        [id, quantityChange, movementType, notes, userId]
      );
      
      await connection.commit();
      
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get low stock items
  static async getLowStockItems() {
    const [rows] = await db.query(
      'SELECT * FROM parts WHERE quantity <= low_stock_threshold ORDER BY (quantity / low_stock_threshold)'
    );
    return this.transformArrayToCamelCase(rows);
  }

  // Get stock movement history for a part
  static async getStockMovements(partId) {
    const [rows] = await db.query(
      `SELECT sm.*, u.name as user_name 
       FROM stock_movements sm 
       LEFT JOIN users u ON sm.user_id = u.id 
       WHERE sm.part_id = ? 
       ORDER BY sm.created_at DESC`,
      [partId]
    );
    
    // Transform for frontend
    return rows.map(movement => ({
      id: movement.id,
      type: movement.movement_type,
      quantity: movement.quantity_change,
      date: movement.created_at,
      note: movement.notes,
      user: movement.user_name
    }));
  }

  // Get categories
  static async getCategories() {
    const [rows] = await db.query(
      'SELECT DISTINCT category FROM parts WHERE category IS NOT NULL'
    );
    return rows.map(row => row.category);
  }
}

module.exports = Part;