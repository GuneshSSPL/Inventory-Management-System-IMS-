import { sql, pool, poolConnect } from '../config/db.js';

export const getAllCategories = async (req, res) => {
    await poolConnect;
    try {
      const result = await pool.request().query('SELECT * FROM Categories');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).send('Server error');
    }
  };

  export const createCategory = async (req, res) => {
    const { CategoryName } = req.body;
    if (!CategoryName) return res.status(400).send('CategoryName is required');
  
    await poolConnect;
    try {
      const result = await pool.request()
        .input('CategoryName', sql.VarChar, CategoryName)
        .query('INSERT INTO Categories (CategoryName) VALUES (@CategoryName)');
      res.status(201).send('Category created');
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).send('Server error');
    }
  };