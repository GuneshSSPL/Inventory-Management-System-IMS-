import db from './models/index.js'; // Imports sequelize instance and all models

async function testConnectionAndSync() {
  try {
    // Test the connection
    await db.sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Sync all defined models to the DB.
    // This will create tables if they don't exist (and do nothing if they already exist).
    // Use { force: true } to drop and re-create tables (BE CAREFUL WITH THIS IN PRODUCTION).
    // Use { alter: true } to attempt to alter existing tables to match model (also use with caution).
    await db.sequelize.sync({ alter: true }); // Using alter: true for development flexibility
    console.log('All models were synchronized successfully. Tables should match model definitions.');

    // Optional: You can add a simple query here to test a model
    // const userCount = await db.User.count();
    // console.log(`Found ${userCount} users.`);

  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
  } finally {
    // Close the connection pool
    await db.sequelize.close();
    console.log('Database connection closed.');
  }
}

testConnectionAndSync();
