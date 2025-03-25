const { Person, Expense, Income } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all persons
 */
exports.getAll = async (req, res) => {
  try {
    const persons = await Person.findAll({
      where: {
        clientId: {
          [Op.or]: [req.headers.clientid, null],
        },
      },
      order: [['name', 'ASC']],
    });
    res.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ message: 'Error fetching persons' });
  }
};

/**
 * Get person by ID
 */
exports.getById = async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ message: 'Error fetching person' });
  }
};

/**
 * Create a new person
 */
exports.create = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;
    
    // Check if person with this name already exists
    const existingPerson = await Person.findOne({
      where: {
        name,
        clientId: req.headers.clientid,
      },
    });
    
    if (existingPerson) {
      return res.status(400).json({ message: 'A person with this name already exists' });
    }
    
    const person = await Person.create({
      name,
      description,
      isActive,
      clientId: req.headers.clientid,
    });
    
    res.status(201).json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ message: 'Error creating person' });
  }
};

/**
 * Update a person by ID
 */
exports.update = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    // Find person by ID
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Check if new name already exists for a different person
    if (name && name !== person.name) {
      const existingPerson = await Person.findOne({
        where: {
          name,
          clientId: req.headers.clientid,
          id: { [Op.ne]: req.params.id },
        },
      });
      
      if (existingPerson) {
        return res.status(400).json({ message: 'A person with this name already exists' });
      }
    }
    
    // Update person data
    const oldName = person.name;
    person.name = name || person.name;
    person.description = description !== undefined ? description : person.description;
    person.isActive = isActive !== undefined ? isActive : person.isActive;
    
    await person.save();
    
    // If name changed, update all expenses and incomes with this person
    if (name && name !== oldName) {
      await Promise.all([
        Expense.update(
          { person: name },
          { where: { person: oldName, clientId: req.headers.clientid } }
        ),
        Income.update(
          { person: name },
          { where: { person: oldName, clientId: req.headers.clientid } }
        )
      ]);
    }
    
    res.json(person);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ message: 'Error updating person' });
  }
};

/**
 * Delete a person by ID
 */
exports.delete = async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    await person.destroy();
    
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ message: 'Error deleting person' });
  }
};

/**
 * Toggle person active status
 */
exports.toggleActive = async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    person.isActive = !person.isActive;
    await person.save();
    
    res.json(person);
  } catch (error) {
    console.error('Error toggling person active status:', error);
    res.status(500).json({ message: 'Error toggling person active status' });
  }
}; 