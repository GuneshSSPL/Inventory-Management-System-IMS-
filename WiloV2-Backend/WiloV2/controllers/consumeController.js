import { now } from 'sequelize/lib/utils';
import db from '../models/index.js'; // Import the db object
import MaterialTransaction from '../models/inventoryTransaction.js'; // Corrected import
import MailHistory from '../models/MailHistory.js';
import  sendLowStockEmail  from '../services/emailService.js';
export const getMaterialByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const material = await db.Material.findOne({ where: { MaterialCode: code } });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const materials = await db.Material.findAll({ attributes: ['MaterialCode'] });
    
    res.json({
      success: true,
      data: materials
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material codes: ' + err.message
    });
  }
};

export const consumeMaterial = async (req, res) => {
  const { materialCode, consumedQuantity } = req.body;

  try {
    const material = await db.Material.findOne({ where: { MaterialCode: materialCode } });

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const parsedConsumedQuantity = parseFloat(consumedQuantity);

    if (isNaN(parsedConsumedQuantity)) {
      return res.status(400).json({ message: 'Consumed quantity must be a valid number.' });
    }

    const newQuantity = material.CurrentQuantity - parsedConsumedQuantity;

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Consumed quantity exceeds current stock.' });
    }

    await material.update({ CurrentQuantity: newQuantity });
  const userId = req.user.userId; 
  console.log("_______________________________________"+userId+"_______________________________________________________" );
  const now = new Date()
  // function getSqlCompatibleDate() {
  //   const now = new Date();
    
  //   return now.toISOString().slice(0, 23).replace('T', ' ');  
  //   console.log(now.toISOString().slice(0, 23).replace('T', ' '));
    
  
  // }
  
  await db.InventoryTransaction.create({
    MaterialCode: material.MaterialCode,
    TransactionType: 'CONSUMPTION',
    Quantity: parsedConsumedQuantity,
    UserID: parseInt(userId)
  });

    // Check for low stock and send email if necessary
    if (newQuantity <= material.ReorderLevel) {
      const lastMail = await db.MailHistory.findOne({
        where: {
          MaterialCode: material.MaterialCode, // Use MaterialCode for MailHistory
        },
        order: [['SentAt', 'DESC']],
      });

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (!lastMail || lastMail.SentAt < twentyFourHoursAgo) {
        await sendLowStockEmail(material); // Ensure sendLowStockEmail can handle the Sequelize material object
      }
    }

    res.status(200).json({ message: 'Material consumed successfully.', material });
  } catch (error) {
    console.error('Error consuming material:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};