const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/dashboard
// @desc    Get dashboard stats
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get total parts count
    const [totalCountResult] = await db.query('SELECT COUNT(*) as count FROM parts');
    const totalParts = totalCountResult[0].count;
    
    // Get low stock parts count
    const [lowStockResult] = await db.query('SELECT COUNT(*) as count FROM parts WHERE quantity <= low_stock_threshold AND quantity > 0');
    const lowStockParts = lowStockResult[0].count;
    
    // Get out of stock parts count
    const [outOfStockResult] = await db.query('SELECT COUNT(*) as count FROM parts WHERE quantity <= 0');
    const outOfStockParts = outOfStockResult[0].count;
    
    // Get categories count
    const [categoriesResult] = await db.query('SELECT COUNT(DISTINCT category) as count FROM parts WHERE category IS NOT NULL');
    const categories = categoriesResult[0].count;
    
    // Get latest parts
    const [latestParts] = await db.query(
      'SELECT id AS _id, name, part_number AS partNumber, category, quantity FROM parts ORDER BY created_at DESC LIMIT 5'
    );
    
    res.json({
      totalParts,
      lowStockParts,
      outOfStockParts,
      categories,
      latestParts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 