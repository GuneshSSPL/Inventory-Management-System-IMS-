import { pool, sql } from '../config/db.js';
import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';
// import csv from 'csv-parser';
// import { Parser } from 'json2csv';

const BARCODE_DIR = path.join('public', 'barcodes');
if (!fs.existsSync(BARCODE_DIR)) fs.mkdirSync(BARCODE_DIR, { recursive: true });

/** Barcode generation helper */
const printBarcode = async (text, fileName) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
    });

    const filePath = path.join(BARCODE_DIR, `${fileName}.png`);
    fs.writeFileSync(filePath, png);
    return `/barcodes/${fileName}.png`;
  } catch (err) {
    console.error('Barcode generation failed:', err);
    throw new Error('Barcode generation failed');
  }
};

/** Material Controllers */
export const getAllMaterials = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM dbo.Materials');
    res.json({ success: true, data: result.recordset }); // Added success: true
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMaterial = async (req, res) => {
  const { MaterialCode, Description, CategoryID, UOM, UnitPrice, CurrentQuantity, SupplierID, ReorderLevel } = req.body; // Added SupplierID and ReorderLevel
  const userId = req.user.userId; // Get userId from the authenticated user

  try {
    // Check for duplicate MaterialCode
    const duplicateCheck = await pool.request()
      .input('MaterialCode', sql.NVarChar(200), MaterialCode)
      .query('SELECT COUNT(*) AS count FROM Materials WHERE MaterialCode = @MaterialCode');

    if (duplicateCheck.recordset[0].count > 0) {
      return res.status(409).json({ message: 'MaterialCode already exists' });
    }

    // Insert material
    await pool.request()
      .input('MaterialCode', sql.NVarChar(200), MaterialCode)
      .input('Description', sql.NVarChar(255), Description)
      .input('CategoryID', sql.Int, CategoryID)
      .input('CurrentQuantity', sql.Int, CurrentQuantity)
      .input('UOM', sql.NVarChar(40), UOM)
      .input('UnitPrice', sql.Decimal(18, 2), UnitPrice)
      .input('SupplierID', sql.Int, SupplierID) // Added SupplierID
      .input('ReorderLevel', sql.Int, ReorderLevel) // Added ReorderLevel
      .query(`
        INSERT INTO Materials (MaterialCode, Description, CategoryID, UOM, UnitPrice, CurrentQuantity, SupplierID, ReorderLevel)
        VALUES (@MaterialCode, @Description, @CategoryID, @UOM, @UnitPrice, @CurrentQuantity, @SupplierID, @ReorderLevel)
      `);

    // Create initial inward transaction
    await pool.request()
      .input('MaterialCode', sql.NVarChar(200), MaterialCode)
      .input('UserID', sql.Int, userId) // Use the authenticated user's ID
      .input('TransactionType', sql.NVarChar(50), 'inward')
      .input('Quantity', sql.Int, CurrentQuantity)
      .input('TransactionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO InventoryTransactions 
          (MaterialCode, UserID, TransactionType, Quantity, TransactionDate)
        VALUES 
          (@MaterialCode, @UserID, @TransactionType, @Quantity, @TransactionDate)
      `);

    // Generate and save barcode
    const fileName = `MAT-${MaterialCode}`;
    const barcodePath = await printBarcode(MaterialCode, fileName);

    // Update barcode path in DB
    await pool.request()
      .input('BarcodeData', sql.NVarChar(255), barcodePath)
      .input('MaterialCode', sql.NVarChar(200), MaterialCode)
      .query('UPDATE Materials SET BarcodeData = @BarcodeData WHERE MaterialCode = @MaterialCode');

    res.status(201).json({
      success: true,
      data: { 
        MaterialCode, 
        BarcodePath: barcodePath,
        BarcodeURL: `${req.protocol}://${req.get('host')}${barcodePath}`
      }
    });

  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create material' 
    });
  }
};

export const getMaterialByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.request()
      .input('MaterialCode', sql.NVarChar(200), code)
      .query('SELECT * FROM Materials WHERE MaterialCode = @MaterialCode');

    res.json({ data: result.recordset[0] || {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateMaterialBarcode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Verify material exists
    const material = await pool.request()
      .input('MaterialCode', sql.NVarChar(200), code)
      .query('SELECT * FROM Materials WHERE MaterialCode = @MaterialCode');

    if (material.recordset.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Generate new barcode
    const fileName = `${code}-${Date.now()}`;
    const barcodePath = await printBarcode(code, fileName);

    // Update DB with new barcode
    await pool.request()
      .input('BarcodeData', sql.NVarChar(255), barcodePath)
      .input('MaterialCode', sql.NVarChar(200), code)
      .query('UPDATE Materials SET BarcodeData = @BarcodeData WHERE MaterialCode = @MaterialCode');

    res.json({
      message: 'Barcode generated',
      barcodeURL: `${req.protocol}://${req.get('host')}${barcodePath}`
    });

  } catch (err) {
    console.error('Barcode generation error:', err);
    res.status(500).json({ message: err.message || 'Barcode generation failed' });
  }
};

/** CSV Import with duplicate check */
export const importMaterials = async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  try {
    const materials = [];
    const filePath = path.join(process.cwd(), req.file.path);

    // Process CSV and check duplicates
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          const exists = await pool.request()
            .input('MaterialCode', sql.NVarChar(200), row.MaterialCode)
            .query('SELECT COUNT(*) AS count FROM Materials WHERE MaterialCode = @MaterialCode');

          if (exists.recordset[0].count === 0) {
            materials.push({
              MaterialCode: row.MaterialCode,
              Description: row.Description,
              CategoryID: parseInt(row.CategoryID || 0),
              SupplierID: parseInt(row.SupplierID || 0),
              UOM: row.UOM,
              CurrentQuantity: parseInt(row.CurrentQuantity || 0)
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert validated materials
    const request = pool.request();
    for (const material of materials) {
      await request
        .input('MaterialCode', sql.NVarChar(200), material.MaterialCode)
        .input('Description', sql.NVarChar(255), material.Description)
        .input('CategoryID', sql.Int, material.CategoryID)
        .input('SupplierID', sql.Int, material.SupplierID)
        .input('UOM', sql.NVarChar(40), material.UOM)
        .input('CurrentQuantity', sql.Int, material.CurrentQuantity)
        .query(`
          INSERT INTO Materials 
            (MaterialCode, Description, CategoryID, SupplierID, UOM, CurrentQuantity)
          VALUES 
            (@MaterialCode, @Description, @CategoryID, @SupplierID, @UOM, @CurrentQuantity)
        `);
    }

    fs.unlinkSync(filePath);
    res.status(201).json({ 
      message: 'Materials imported successfully',
      count: materials.length 
    });

  } catch (err) {
    console.error('Import error:', err);
    res.status(500).send(err.message || 'Import failed');
  }
};

export const exportMaterials = async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Materials');
    const materials = result.recordset;

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(materials);

    res.header('Content-Type', 'text/csv');
    res.attachment('materials.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting materials:', err);
    res.status(500).send(err.message || 'Error exporting materials');
  }
};

export const getBarcodeImage = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BARCODE_DIR, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    res.sendFile(filePath, { root: process.cwd() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error retrieving barcode' });
  }
};