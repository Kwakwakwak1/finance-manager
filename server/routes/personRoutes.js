const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

// GET /api/persons - Get all persons
router.get('/', personController.getAll);

// GET /api/persons/:id - Get person by ID
router.get('/:id', personController.getById);

// POST /api/persons - Create a new person
router.post('/', personController.create);

// PUT /api/persons/:id - Update a person
router.put('/:id', personController.update);

// DELETE /api/persons/:id - Delete a person
router.delete('/:id', personController.delete);

// PATCH /api/persons/:id/toggle-active - Toggle person active status
router.patch('/:id/toggle-active', personController.toggleActive);

module.exports = router; 