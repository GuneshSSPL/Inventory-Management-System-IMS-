import express from 'express';
import db from '../models/index.js'; // Import the db object
import sendLowStockEmail from '../services/emailService.js';

const router = express.Router();

// Temporary API endpoint to test low stock email service
router.get('/test-low-stock-email/:materialId', async (req, res) => {
    try {
        const { materialId } = req.params;

        // Fetch the material by ID using db.Material
        const material = await db.Material.findByPk(materialId);

        if (!material) {
            return res.status(404).json({ message: 'Material not found.' });
        }

        // Find all admin users using db.User
        const adminUsers = await db.User.findAll({
            include: [{
                model: db.Role,
                as: 'Role', // Add this line
                where: { RoleName: 'admin' },
                attributes: [] // We don't need Role attributes in the result
            }],
            attributes: ['Email'] // Only fetch email addresses
        });

        const adminEmails = adminUsers.map(user => user.Email);

        if (adminEmails.length === 0) {
            console.warn('No admin emails found to send low stock notification.');
            return res.status(404).json({ message: 'No admin emails found to send low stock notification.' });
        }

        // Trigger the low stock email service
        await sendLowStockEmail(material, adminEmails);

        res.status(200).json({ message: 'Low stock email triggered successfully for testing.', material: material.MaterialName, recipients: adminEmails });
    } catch (error) {
        console.error('Error triggering low stock email for testing:', error);
        res.status(500).json({ message: 'Failed to trigger low stock email for testing.', error: error.message });
    }
});

export default router;