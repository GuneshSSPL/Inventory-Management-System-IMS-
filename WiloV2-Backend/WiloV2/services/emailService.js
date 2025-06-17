// emailService.js

// Import the default 'db' object which contains all your models
import db from '../models/index.js';
import nodemailer from 'nodemailer'; // Import nodemailer

// Destructure the models you need from the 'db' object
const { Material, Supplier, MailHistory, User, Role } = db; // Added User and Role

// Export the function as a default export
export default async function sendLowStockEmail(lowStockMaterial) {
  try {
    // Fetch the material again, but this time INCLUDE its associated Supplier
    const materialWithDetails = await Material.findOne({
      where: { MaterialCode: lowStockMaterial.MaterialCode },
      include: [{
        model: Supplier, // Include the Supplier model
        as: 'Supplier', // IMPORTANT: Use the 'as' alias defined in your Material model for Supplier association
        required: false // Use 'false' if a material might not have a supplier
      }]
    });

    if (!materialWithDetails) {
      console.error(`Material ${lowStockMaterial.MaterialCode} not found for email.`);
      return;
    }

    // Now you have access to supplier details, or defaults if none exists
    // Access the Supplier data via the alias used in the include: materialWithDetails.Supplier
    const supplierName = materialWithDetails.Supplier ? materialWithDetails.Supplier.SupplierName : 'N/A';
    const supplierEmail = materialWithDetails.Supplier ? materialWithDetails.Supplier.Email : 'N/A';
    const supplierPhone = materialWithDetails.Supplier ? materialWithDetails.Supplier.PhoneNumber : 'N/A';

    // --- Fetch Admin Emails from DB ---
    const adminRole = await Role.findOne({ where: { RoleName: 'Admin' } });
    let adminEmails = [];
    if (adminRole) {
      const adminUsers = await User.findAll({
        where: { RoleID: adminRole.RoleID },
        include: [{ model: Role, as: 'Role' }] // Ensure 'Role' alias is used as per User model association
      });
      adminEmails = adminUsers.map(user => user.Email).filter(email => email);
    }

    if (adminEmails.length === 0) {
      console.warn('No admin emails found in the database. Cannot send low stock notification.');
      return; // Exit if no recipients
    }
    // --- End Fetch Admin Emails ---
      
    const mailContent =    `
      <p>Dear Admin,</p>
      <p>This is an urgent low stock notification for the following material:</p>
      <ul>
        <li><strong>Material Code:</strong> ${materialWithDetails.MaterialCode}</li>
        <li><strong>Description:</strong> ${materialWithDetails.Description}</li>
        <li><strong>Current Quantity:</strong> ${materialWithDetails.CurrentQuantity}</li>
        <li><strong>Reorder Level:</strong> ${materialWithDetails.ReorderLevel}</li>
        <li><strong>Supplier:</strong> ${supplierName}</li>
        <li><strong>Supplier Email:</strong> ${supplierEmail}</li>
        <li><strong>Supplier Phone:</strong> ${supplierPhone}</li>
      </ul>
      <p>Please take necessary action to reorder this material.</p>
      <p>Thank you,</p>
      <p>Your Inventory Management System</p>
    `;

    // Log the email content to the console for verification
    console.log('--- Email Content ---');
    console.log(mailContent);
    console.log('---------------------');

    // --- Nodemailer Email Sending Logic (Uncomment and Configure) ---
    const transporter = nodemailer.createTransport({
      // Your email service configuration (e.g., SMTP, Gmail)
      service: 'gmail', // Or 'smtp', etc.
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable
        pass: process.env.EMAIL_PASS // Use environment variable
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Use environment variable
      to: adminEmails.join(','), // Use the dynamically fetched admin emails
      subject: `Low Stock Alert: ${materialWithDetails.Description}`,
      html: mailContent
    });
    // --- End Nodemailer Logic ---

    // Create the MailHistory record
    await MailHistory.create({
      MaterialCode: materialWithDetails.MaterialCode,
      MailType: 'Low Stock Alert',
      MailContent: mailContent,
      RecipientEmail: adminEmails.join(','), // Log the actual recipients
      SentAt: new Date()
    });

    console.log(`Low stock email sent successfully for ${materialWithDetails.MaterialCode} to ${adminEmails.join(',')}`);

  } catch (error) {
    console.error(`Error sending low stock email for ${lowStockMaterial.MaterialCode}:`, error);
  }
}