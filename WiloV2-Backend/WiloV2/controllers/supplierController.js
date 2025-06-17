// const { Supplier } = require('../models'); // CommonJS import
// import { Supplier } from '../models/index.js'; // Old ES Module import
import db from '../models/index.js'; // Import the default export
const { Supplier } = db; // Destructure Supplier from the db object

// Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const { SupplierName, Email, PhoneNumber, Address } = req.body;
    if (!SupplierName) {
      return res.status(400).json({ message: 'SupplierName is required' });
    }
    const newSupplier = await Supplier.create({
      SupplierName,
      Email,
      PhoneNumber,
      Address,
    });
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
};

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      attributes: ['SupplierID', 'SupplierName', 'Email', 'PhoneNumber', 'Address', 'CreatedAt', 'UpdatedAt']
    });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
};

// Get a single supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id, {
      attributes: ['SupplierID', 'SupplierName', 'Email', 'PhoneNumber', 'Address', 'CreatedAt', 'UpdatedAt']
    });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error: error.message });
  }
};

// Update a supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { SupplierName, Email, PhoneNumber, Address } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.SupplierName = SupplierName !== undefined ? SupplierName : supplier.SupplierName;
    supplier.Email = Email !== undefined ? Email : supplier.Email;
    supplier.PhoneNumber = PhoneNumber !== undefined ? PhoneNumber : supplier.PhoneNumber;
    supplier.Address = Address !== undefined ? Address : supplier.Address;

    await supplier.save();
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
};

// Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    await supplier.destroy();
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
};
  