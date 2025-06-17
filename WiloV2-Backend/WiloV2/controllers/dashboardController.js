// dashboardController.js
import { pool } from '../config/db.js'; // Ensure correct import path

export const getDashboardStats = async (req, res) => {
  try {
    const request = pool.request(); 
    // This fetches all materials. If the Materials table is empty, materialsData will be an empty array.
    const result = await request.query('SELECT * FROM Materials;'); 
    const materialsData = result.recordset;

    // Log the data being sent to the frontend
    console.log('Sending materialsData to frontend:', JSON.stringify(materialsData));

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: materialsData // This will be an empty array if the table is empty
    });

  } catch (err) {
    console.error('Database error in getDashboardStats:', err);
    // It's good practice to also log req.user here to see who made the request if there's an error
    console.error('Requesting user:', JSON.stringify(req.user)); 
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch materials' 
    });
  }
};