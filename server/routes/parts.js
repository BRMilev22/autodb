const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Part = require('../models/Part');
const auth = require('../middleware/auth');

// @route   GET api/parts
// @desc    Get all parts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      lowStock: req.query.lowStock === 'true',
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    
    const parts = await Part.findAll(filters);
    res.json(parts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/parts/low-stock
// @desc    Get all parts with low stock
// @access  Private
router.get('/low-stock', auth, async (req, res) => {
  try {
    const parts = await Part.getLowStockItems();
    res.json(parts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/parts/categories
// @desc    Get all unique categories
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Part.getCategories();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/parts/:id
// @desc    Get part by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    
    if (!part) {
      return res.status(404).json({ msg: 'Part not found' });
    }
    
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/parts/:id/history
// @desc    Get stock movement history for a part
// @access  Private
router.get('/:id/history', auth, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    
    if (!part) {
      return res.status(404).json({ msg: 'Part not found' });
    }
    
    const history = await Part.getStockMovements(req.params.id);
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/parts
// @desc    Create a new part
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('partNumber', 'Part number is required').not().isEmpty(),
      check('name', 'Name is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if part with same part number already exists
      const existingPart = await Part.findByPartNumber(req.body.partNumber);
      if (existingPart) {
        return res.status(400).json({ msg: 'Part with this part number already exists' });
      }
      
      const part = await Part.create(req.body);
      res.status(201).json(part);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/parts/:id
// @desc    Update a part
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let part = await Part.findById(req.params.id);
    
    if (!part) {
      return res.status(404).json({ msg: 'Part not found' });
    }
    
    // If changing part number, check if new part number already exists
    if (req.body.partNumber && req.body.partNumber !== part.partNumber) {
      const existingPart = await Part.findByPartNumber(req.body.partNumber);
      if (existingPart && existingPart._id !== parseInt(req.params.id)) {
        return res.status(400).json({ msg: 'Part with this part number already exists' });
      }
    }
    
    part = await Part.update(req.params.id, req.body);
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/parts/:id
// @desc    Delete a part
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    
    if (!part) {
      return res.status(404).json({ msg: 'Part not found' });
    }
    
    await Part.delete(req.params.id);
    res.json({ msg: 'Part removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/parts/:id/stock
// @desc    Update part stock quantity
// @access  Private
router.put(
  '/:id/stock',
  [
    auth,
    [
      check('quantity_change', 'Quantity change is required').isInt()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { quantity_change, notes, movement_type } = req.body;
      const part = await Part.updateStock(
        req.params.id,
        parseInt(quantity_change),
        req.user.id,
        notes,
        movement_type
      );
      
      res.json(part);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Part not found') {
        return res.status(404).json({ msg: 'Part not found' });
      } else if (err.message === 'Cannot reduce quantity below zero') {
        return res.status(400).json({ msg: 'Cannot reduce quantity below zero' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   PATCH api/parts/:id/sell
// @desc    Mark a part as sold (decrement quantity)
// @access  Private
router.patch('/:id/sell', auth, async (req, res) => {
  try {
    const { quantity = 1, notes = "Sale" } = req.body;
    
    // Call updateStock with negative quantity to simulate a sale
    const part = await Part.updateStock(
      req.params.id,
      parseInt(quantity) * -1, // Convert to negative for deduction
      req.user.id,
      notes,
      'sale'
    );
    
    res.json(part);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Part not found') {
      return res.status(404).json({ msg: 'Part not found' });
    } else if (err.message === 'Cannot reduce quantity below zero') {
      return res.status(400).json({ msg: 'Cannot sell more than available quantity' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;