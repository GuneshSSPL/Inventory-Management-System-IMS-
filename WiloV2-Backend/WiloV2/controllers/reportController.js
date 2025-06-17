import { pool, sql, poolConnect } from '../config/db.js';
import PDFDocument from 'pdfkit';
import moment from 'moment';

export const getCustomReport = async (req, res) => {
  try {
    const { from, to, type, month, year, week, daily } = req.query;
    let query = `
      SELECT 
        t.TransactionID, 
        t.TransactionType, 
        t.Quantity, 
        t.TransactionDate, 
        m.MaterialCode, 
        m.Description, 
        u.Email as UserEmail
      FROM dbo.InventoryTransactions t
      JOIN dbo.Materials m ON t.MaterialCode = m.MaterialCode
      JOIN dbo.Users u ON t.UserID = u.UserID
      WHERE 1=1
    `;
    
    const request = pool.request();

    if (from) {
      query += ' AND t.TransactionDate >= @from';
      request.input('from', sql.DateTime, from);
    }

    if (to) {
      query += ' AND t.TransactionDate <= @to';
      request.input('to', sql.DateTime, to);
    }

    if (type) {
      query += ` AND UPPER(t.TransactionType) = UPPER(@type)`;
      request.input('type', sql.NVarChar, type);
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      query += ' AND DATEPART(year, t.TransactionDate) = @year AND DATEPART(month, t.TransactionDate) = @month';
      request.input('year', sql.Int, parseInt(yearStr));
      request.input('month', sql.Int, parseInt(monthStr));
    }

    if (year) {
      query += ' AND DATEPART(year, t.TransactionDate) = @year';
      request.input('year', sql.Int, parseInt(year));
    }

    if (week) {
      const [yearStr, weekStr] = week.split('-');
      const startDate = moment().year(parseInt(yearStr)).isoWeek(parseInt(weekStr.replace('W', ''))).startOf('isoWeek').toDate();
      const endDate = moment().year(parseInt(yearStr)).isoWeek(parseInt(weekStr.replace('W', ''))).endOf('isoWeek').toDate();
      query += ' AND t.TransactionDate >= @startDate AND t.TransactionDate <= @endDate';
      request.input('startDate', sql.DateTime, startDate);
      request.input('endDate', sql.DateTime, endDate);
    }

    if (daily) {
      query += ' AND CAST(t.TransactionDate AS DATE) = @daily';
      request.input('daily', sql.Date, daily);
    }

    query += ' ORDER BY t.TransactionDate DESC';

    await poolConnect;
    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Custom report error:", err);
    res.status(500).json({ message: "Server error generating report" });
  }
};

export const exportPDFReport = async (req, res) => {
  try {
    const { from, to, type, month, year, week, daily } = req.query;
    let query = `
      SELECT 
        t.TransactionID, 
        t.TransactionType, 
        t.Quantity, 
        t.TransactionDate, 
        m.MaterialCode, 
        m.Description, 
        u.Email as UserEmail
      FROM dbo.InventoryTransactions t
      JOIN dbo.Materials m ON t.MaterialCode = m.MaterialCode
      JOIN dbo.Users u ON t.UserID = u.UserID
      WHERE 1=1
    `;
    
    const request = pool.request();

    if (from) {
      query += ' AND t.TransactionDate >= @from';
      request.input('from', sql.DateTime, from);
    }

    if (to) {
      query += ' AND t.TransactionDate <= @to';
      request.input('to', sql.DateTime, to);
    }

    if (type) {
      query += ` AND t.TransactionType LIKE @type`;
      request.input('type', sql.NVarChar, `%${type.toUpperCase()}%`);
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      query += ' AND DATEPART(year, t.TransactionDate) = @year AND DATEPART(month, t.TransactionDate) = @month';
      request.input('year', sql.Int, parseInt(yearStr));
      request.input('month', sql.Int, parseInt(monthStr));
    }

    if (year) {
      query += ' AND DATEPART(year, t.TransactionDate) = @year';
      request.input('year', sql.Int, parseInt(year));
    }

    if (week) {
      const [yearStr, weekStr] = week.split('-');
      const startDate = moment().year(parseInt(yearStr)).isoWeek(parseInt(weekStr.replace('W', ''))).startOf('isoWeek').toDate();
      const endDate = moment().year(parseInt(yearStr)).isoWeek(parseInt(weekStr.replace('W', ''))).endOf('isoWeek').toDate();
      query += ' AND t.TransactionDate >= @startDate AND t.TransactionDate <= @endDate';
      request.input('startDate', sql.DateTime, startDate);
      request.input('endDate', sql.DateTime, endDate);
    }

    if (daily) {
      query += ' AND CAST(t.TransactionDate AS DATE) = @daily';
      request.input('daily', sql.Date, daily);
    }

    query += ' ORDER BY t.TransactionDate DESC';

    await poolConnect;
    const result = await request.query(query);
    const data = result.recordset;

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Custom Report', { align: 'center' });
    doc.moveDown();

    let filters = [];
    if (from || to || month || year || week || daily || type) {
      if (from) filters.push(`From: ${from}`);
      if (to) filters.push(`To: ${to}`);
      if (month) filters.push(`Month: ${month}`);
      if (year) filters.push(`Year: ${year}`);
      if (week) filters.push(`Week: ${week}`);
      if (daily) filters.push(`Daily: ${daily}`);
      if (type) filters.push(`Type: ${type}`);
      doc.fontSize(12).text(`Filters: ${filters.join(', ')}`);
      doc.moveDown();
    }

    doc.fontSize(12)
      .text('ID', 50, doc.y, { width: 40, align: 'left', continued: true })
      .text('Type', 90, doc.y, { width: 80, align: 'left', continued: true })
      .text('Qty', 170, doc.y, { width: 40, align: 'right', continued: true })
      .text('Date', 220, doc.y, { width: 100, align: 'left', continued: true })
      .text('Material', 320, doc.y, { width: 100, align: 'left', continued: true })
      .text('User', 420, doc.y, { width: 100, align: 'left' });
    doc.moveDown();

    data.forEach(row => {
      doc.text(row.TransactionID, 50, doc.y, { width: 40, align: 'left', continued: true })
        .text(row.TransactionType, 90, doc.y, { width: 80, align: 'left', continued: true })
        .text(row.Quantity.toString(), 170, doc.y, { width: 40, align: 'right', continued: true })
        .text(new Date(row.TransactionDate).toLocaleString(), 220, doc.y, { width: 100, align: 'left', continued: true })
        .text(row.MaterialCode, 320, doc.y, { width: 100, align: 'left', continued: true })
        .text(row.UserEmail, 420, doc.y, { width: 100, align: 'left' });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Error generating PDF report" });
  }
};