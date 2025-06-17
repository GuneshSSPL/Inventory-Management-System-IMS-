import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';

const BARCODE_DIR = path.join(process.cwd(), 'public', 'barcodes');
if (!fs.existsSync(BARCODE_DIR)) {
  fs.mkdirSync(BARCODE_DIR, { recursive: true });
}

export const printBarcode = async (text, fileName) => {
  if (!text) throw new Error('Barcode text is required');

  try {
    // Generate barcode image
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
    });

    // Save barcode image
    const filePath = path.join(BARCODE_DIR, `${fileName || text}.png`);
    fs.writeFileSync(filePath, png);

    // Return the relative path to the barcode image
    return `/barcodes/${fileName || text}.png`;
  } catch (err) {
    console.error('Error generating barcode:', err);
    throw new Error('Failed to generate barcode');
  }
};