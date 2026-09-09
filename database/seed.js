const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const bcrypt = require(path.join(__dirname, '../backend/node_modules/bcryptjs'));
const { sequelize, User } = require('../backend/src/models');
const logger = require('../backend/src/utils/logger');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database for seeding...');

    // Clear existing data
    await User.destroy({ where: {}, truncate: { cascade: true } });

    logger.info('Cleaned existing tables.');

    const adminPassword = await bcrypt.hash('Admin@123', 12);

    // Only predefined admin user
    const admin = await User.create({
      full_name: 'Admin Kisan Connect',
      email: 'admin@kisanconnect.in',
      mobile: '9876543210',
      password_hash: adminPassword,
      role: 'admin',
      is_verified: true,
      preferred_lang: 'en'
    });

    logger.info('Admin user created:', { mobile: admin.mobile, role: admin.role });
    logger.info('Database seeded successfully! (Only admin user)');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedData();