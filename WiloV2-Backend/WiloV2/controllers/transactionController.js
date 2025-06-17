import { pool, sql } from '../config/db.js';
import db from '../models/index.js'; // Import the initialized db object
import sendLowStockEmail from '../services/emailService.js'; // Import the email service

// Destructure User, Role, Material, and Supplier from the db object for proper association handling
const { User, Role, Material, Supplier, InventoryTransaction } = db; // Use db.User, db.Role, etc.
// Create Inward Transaction
export const createInwardTransaction = async (req, res) => {
  await handleTransaction(req, res, 'INWARD');
};

// Create Consumption Transaction
export const createConsumptionTransaction = async (req, res) => {
  await handleTransaction(req, res, 'CONSUMPTION');
};

// Common Handler
const handleTransaction = async (req, res, type) => {
  try {
    const { materialCode, quantity } = req.body; 
    const userId = req.user.userId;

    if (!materialCode || !quantity) { 
      return res.status(400).json({ message: 'Material Code and quantity are required' });
    }

    const material = await Material.findOne({ where: { MaterialCode: materialCode } });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Use Sequelize transaction
    const transaction = await db.sequelize.transaction();

    try {
      // Insert transaction using Sequelize
      await InventoryTransaction.create({
        MaterialCode: material.MaterialCode, // Use MaterialCode from found material
        UserID: userId,
        TransactionType: type,
        Quantity: quantity,
        TransactionDate: new Date(),
      }, { transaction });

      const operator = type === 'INWARD' ? '+' : '-';

      // Update stock using Sequelize
      await Material.update(
        { CurrentQuantity: db.sequelize.literal(`CurrentQuantity ${operator} ${quantity}`) },
        { where: { MaterialCode: material.MaterialCode }, transaction }
      );

      await transaction.commit();

      // Check for low stock and send email if it's an INWARD or CONSUMPTION transaction
      if (type === 'INWARD' || type === 'CONSUMPTION') {
        // Re-fetch material to get updated quantity
        const updatedMaterial = await Material.findOne({
          where: { MaterialCode: material.MaterialCode },
          include: [{ model: Supplier, as: 'Supplier' }] // Include Supplier for email service
        });

        if (updatedMaterial && updatedMaterial.CurrentQuantity <= updatedMaterial.ReorderLevel) {
          // Fetch admin emails dynamically
          const adminRole = await Role.findOne({ where: { RoleName: 'Admin' } });
          if (adminRole) {
            const adminUsers = await User.findAll({
              where: { RoleID: adminRole.RoleID },
              include: [{ model: Role, as: 'Role' }]
            });
            const adminEmails = adminUsers.map(user => user.Email).filter(email => email);

            if (adminEmails.length > 0) {
              await sendLowStockEmail(updatedMaterial, adminEmails);
            } else {
              console.warn('No admin emails found to send low stock notification.');
            }
          } else {
            console.warn('Admin role not found. Cannot send low stock notification.');
          }
        }
      }

      res.status(201).json({ message: `${type} transaction recorded successfully` });
    } catch (error) {
      await transaction.rollback();
      console.error(`${type} Transaction Error:`, error);
      res.status(500).json({ message: 'Transaction failed' });
    }

  } catch (error) {
    console.error(`${type} Error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInwardTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.findAll({
      where: { TransactionType: 'INWARD' },
      include: [
        { model: Material, attributes: ['MaterialCode', 'Description'] },
        { model: User, attributes: ['Email'], as: 'User' }
      ],
      order: [['TransactionDate', 'DESC']]
    });

    const formattedTransactions = transactions.map(t => ({
      TransactionID: t.TransactionID,
      TransactionType: t.TransactionType,
      Quantity: t.Quantity,
      TransactionDate: t.TransactionDate,
      MaterialCode: t.Material.MaterialCode,
      Description: t.Material.Description,
      PerformedBy: t.User.Email
    }));

    res.json(formattedTransactions);
  } catch (err) {
    console.error('Error fetching inward transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.findAll({
      include: [
        { model: Material, attributes: ['MaterialCode', 'Description'] },
        { model: User, attributes: ['Email'], as: 'User' }
      ],
      order: [['TransactionDate', 'DESC']]
    });

    const formattedTransactions = transactions.map(t => ({
      TransactionID: t.TransactionID,
      TransactionType: t.TransactionType,
      Quantity: t.Quantity,
      TransactionDate: t.TransactionDate,
      MaterialCode: t.Material.MaterialCode,
      Description: t.Material.Description,
      PerformedBy: t.User.Email
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Transaction History Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Daily Report
export const getDailyReport = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        CAST(TransactionDate AS DATE) AS Date,
        TransactionType,
        SUM(Quantity) AS TotalQuantity
      FROM dbo.InventoryTransactions
      WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)
      GROUP BY CAST(TransactionDate AS DATE), TransactionType
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Daily Report Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Monthly Summary
export const getMonthlySummary = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        FORMAT(TransactionDate, 'yyyy-MM') AS Month,
        TransactionType,
        SUM(Quantity) AS TotalQuantity
      FROM dbo.InventoryTransactions
      WHERE TransactionDate >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY FORMAT(TransactionDate, 'yyyy-MM'), TransactionType
      ORDER BY Month DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Monthly Summary Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const consumeMaterialByQR = async (req, res) => {
  try { 
    const { scannedCode, quantity, userId, machineId, departmentId, referenceDoc } = req.body;

    const material = await Material.findOne({ where: { MaterialCode: scannedCode } });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.CurrentQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Use Sequelize transaction for atomicity
    const transaction = await db.sequelize.transaction();

    try {
      // Update stock using Sequelize
      await Material.update(
        { CurrentQuantity: material.CurrentQuantity - quantity },
        { where: { MaterialCode: scannedCode }, transaction }
      );

      // Insert transaction log using Sequelize
      await InventoryTransaction.create({
        MaterialCode: scannedCode,
        UserID: userId,
        TransactionType: 'CONSUMPTION',
        Quantity: quantity,
        TransactionDate: new Date(),
      }, { transaction });

      await transaction.commit();

      res.status(200).json({ message: 'Consumption recorded successfully' });
    } catch (err) {
      await transaction.rollback();
      console.error('QR Consumption Transaction Error:', err);
      res.status(500).json({ message: 'Error recording consumption' });
    }
  } catch (err) {
    console.error('QR Consumption Error:', err);
    res.status(500).json({ message: 'Error recording consumption' });
  }
};


export const getConsumptionTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.findAll({
      where: { TransactionType: 'CONSUMPTION' },
      include: [
        { model: Material, attributes: ['MaterialCode', 'Description'] },
        { model: User, attributes: ['Email'], as: 'User' }
      ],
      order: [['TransactionDate', 'DESC']]
    });

    const formattedTransactions = transactions.map(t => ({
      TransactionID: t.TransactionID,
      TransactionType: t.TransactionType,
      Quantity: t.Quantity,
      TransactionDate: t.TransactionDate,
      MaterialCode: t.Material.MaterialCode,
      Description: t.Material.Description,
      PerformedBy: t.User.Email
    }));

    res.json(formattedTransactions);
  } catch (err) {
    console.error('Error fetching consumption transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};