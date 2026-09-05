const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const bcrypt = require(path.join(__dirname, '../backend/node_modules/bcryptjs'));
const { sequelize, User, Farmer, BulkBuyer, LogisticsPartner, Listing, Grievance } = require('../backend/src/models');
const logger = require('../backend/src/utils/logger');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database for seeding...');

    // Clear existing data (in reverse order of dependencies)
    await Grievance.destroy({ where: {}, truncate: { cascade: true } });
    await Listing.destroy({ where: {}, truncate: { cascade: true } });
    await Farmer.destroy({ where: {}, truncate: { cascade: true } });
    await BulkBuyer.destroy({ where: {}, truncate: { cascade: true } });
    await LogisticsPartner.destroy({ where: {}, truncate: { cascade: true } });
    await User.destroy({ where: {}, truncate: { cascade: true } });

    logger.info('Cleaned existing tables.');

    const defaultPassword = await bcrypt.hash('Password@123', 12);

    // 1. Admin User
    const admin = await User.create({
      full_name: 'Admin Kisan Connect',
      email: 'admin@kisanconnect.in',
      mobile: '9876543210',
      password_hash: defaultPassword,
      role: 'admin',
      is_verified: true,
      preferred_lang: 'en'
    });

    // 2. Farmers
    const farmerUsers = [
      {
        full_name: 'Ramesh Patil',
        email: 'ramesh.patil@kisanconnect.in',
        mobile: '9876543211',
        district: 'Nashik',
        state: 'Maharashtra',
        village: 'Pimpalgaon Baswant',
        crops: ['Tomato', 'Onion', 'Grapes']
      },
      {
        full_name: 'Suresh Kumar',
        email: 'suresh.kumar@kisanconnect.in',
        mobile: '9876543212',
        district: 'Pune',
        state: 'Maharashtra',
        village: 'Manchar',
        crops: ['Potato', 'Cabbage', 'Cauliflower']
      },
      {
        full_name: 'Gurpreet Singh',
        email: 'gurpreet.singh@kisanconnect.in',
        mobile: '9876543213',
        district: 'Amritsar',
        state: 'Punjab',
        village: 'Rayya',
        crops: ['Wheat', 'Basmati Rice']
      },
      {
        full_name: 'Muthusamy K',
        email: 'muthusamy@kisanconnect.in',
        mobile: '9876543214',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        village: 'Pollachi',
        crops: ['Coconut', 'Turmeric', 'Banana']
      },
      {
        full_name: 'Rajendra Sharma',
        email: 'rajendra.sharma@kisanconnect.in',
        mobile: '9876543215',
        district: 'Jaipur',
        state: 'Rajasthan',
        village: 'Chomu',
        crops: ['Mustard', 'Bajra', 'Watermelon']
      }
    ];

    for (const f of farmerUsers) {
      const u = await User.create({
        full_name: f.full_name,
        email: f.email,
        mobile: f.mobile,
        password_hash: defaultPassword,
        role: 'farmer',
        is_verified: true,
        preferred_lang: 'hi'
      });

      const farmer = await Farmer.create({
        user_id: u.id,
        district: f.district,
        state: f.state,
        village: f.village,
        land_area_acres: 5.5,
        is_kyc_done: true,
        total_earnings: 45000.00,
        rating: 4.8,
        rating_count: 12
      });

      // Add sample listings
      for (const crop of f.crops) {
        await Listing.create({
          farmer_id: farmer.id,
          crop_name: crop,
          crop_category: 'Vegetables',
          variety: 'Desi / Local',
          quantity_kg: 500,
          available_kg: 450,
          price_per_kg: 35.00,
          ai_suggested_price: 32.50,
          min_order_kg: 5,
          quality_grade: 'A',
          harvest_date: new Date(),
          expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          description: `Fresh organic ${crop} harvested straight from farm. High quality, naturally grown without chemical pesticides.`,
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
          is_organic: true,
          district: f.district,
          state: f.state,
          lot_number: `KC-${f.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`
        });
      }
    }

    // 3. Consumers
    const consumer = await User.create({
      full_name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      mobile: '9876543220',
      password_hash: defaultPassword,
      role: 'consumer',
      is_verified: true,
      preferred_lang: 'en'
    });

    // 4. Logistics Driver
    const driverUser = await User.create({
      full_name: 'Vijay Verma',
      email: 'vijay.driver@kisanconnect.in',
      mobile: '9876543230',
      password_hash: defaultPassword,
      role: 'logistics',
      is_verified: true,
      preferred_lang: 'hi'
    });

    await LogisticsPartner.create({
      user_id: driverUser.id,
      vehicle_type: 'mini_truck',
      vehicle_number: 'MH-15-AB-1234',
      license_number: 'DL-MH-20180012345',
      district: 'Nashik',
      state: 'Maharashtra',
      status: 'available',
      is_verified: true,
      total_earnings: 12500,
      rating: 4.9
    });

    // 5. Sample Grievance
    await Grievance.create({
      user_id: consumer.id,
      category: 'logistics',
      severity: 'medium',
      description: 'The delivery was delayed by 2 hours from the estimated time window.',
      status: 'open'
    });

    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedData();