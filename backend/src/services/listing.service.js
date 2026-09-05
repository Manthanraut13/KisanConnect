const { Listing, Farmer, User, Order, OrderItem } = require('../models');
const { cloudinary } = require('../config/cloudinary.config');
const { generateQRCode } = require('../utils/qrcode.utils');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/db.config');

const generateLotNumber = (district) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `KC-${district.slice(0, 3).toUpperCase()}-${timestamp}-${random}`;
};

const createListing = async (listingData, farmerId, imageUrls) => {
  const farmer = await Farmer.findOne({ where: { user_id: farmerId } });
  if (!farmer) throw new AppError('Farmer profile not found', 404);

  const lotNumber = generateLotNumber(farmer.district);

  const qrData = {
    version: '1.0',
    platform: 'KisanConnect',
    lot_number: lotNumber,
    crop: listingData.crop_name,
    farmer_id: farmer.id,
    village: farmer.village,
    district: farmer.district,
    state: farmer.state,
    harvest_date: listingData.harvest_date,
    verify_url: `${process.env.APP_URL || 'http://localhost:5000'}/trace/${lotNumber}`,
  };

  const qrCodeUrl = await generateQRCode(qrData);

  const listing = await Listing.create({
    farmer_id: farmer.id,
    crop_name: listingData.crop_name,
    crop_category: listingData.crop_category || 'General',
    variety: listingData.variety,
    quantity_kg: listingData.quantity_kg,
    available_kg: listingData.quantity_kg,
    price_per_kg: listingData.price_per_kg,
    min_order_kg: listingData.min_order_kg || 1,
    quality_grade: listingData.quality_grade || 'B',
    harvest_date: listingData.harvest_date,
    expiry_date: listingData.expiry_date,
    description: listingData.description,
    images: imageUrls || [],
    is_organic: listingData.is_organic || false,
    district: farmer.district,
    state: farmer.state,
    latitude: listingData.latitude || farmer.latitude,
    longitude: listingData.longitude || farmer.longitude,
    qr_code_url: qrCodeUrl,
    lot_number: lotNumber,
  });

  return listing;
};

const getListings = async (filters = {}, limit = 10, offset = 0) => {
  const where = { is_active: true };

  if (filters.crop_name) {
    where.crop_name = { [sequelize.Sequelize.Op.iLike]: `%${filters.crop_name}%` };
  }
  if (filters.district) where.district = filters.district;
  if (filters.state) where.state = filters.state;
  if (filters.quality_grade) where.quality_grade = filters.quality_grade;
  if (filters.is_organic) where.is_organic = filters.is_organic;
  if (filters.min_price && filters.max_price) {
    where.price_per_kg = {
      [sequelize.Sequelize.Op.between]: [filters.min_price, filters.max_price],
    };
  }

  const { rows, count } = await Listing.findAndCountAll({
    where,
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: ['id', 'user_id', 'village', 'district', 'state', 'rating'],
        include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'mobile'] }],
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { listings: rows, total: count };
};

const getListingById = async (listingId) => {
  const listing = await Listing.findByPk(listingId, {
    include: [
      {
        model: Farmer,
        as: 'farmer',
        include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'mobile', 'profile_image'] }],
      },
    ],
  });

  if (!listing) throw new AppError('Listing not found', 404);

  await listing.increment('views_count');

  return listing;
};

const updateListing = async (listingId, farmerId, updateData) => {
  const listing = await Listing.findByPk(listingId);
  if (!listing) throw new AppError('Listing not found', 404);

  const farmer = await Farmer.findOne({ where: { user_id: farmerId } });
  if (!farmer || listing.farmer_id !== farmer.id) {
    throw new AppError('Unauthorized: You can only edit your own listings', 403);
  }

  await listing.update(updateData);
  return listing;
};

const deleteListing = async (listingId, farmerId) => {
  const listing = await Listing.findByPk(listingId);
  if (!listing) throw new AppError('Listing not found', 404);

  const farmer = await Farmer.findOne({ where: { user_id: farmerId } });
  if (!farmer || listing.farmer_id !== farmer.id) {
    throw new AppError('Unauthorized: You can only delete your own listings', 403);
  }

  await listing.update({ is_active: false });
  return { success: true };
};

const getFarmerListings = async (farmerId, limit = 20, offset = 0) => {
  const farmer = await Farmer.findOne({ where: { user_id: farmerId } });
  if (!farmer) throw new AppError('Farmer profile not found', 404);

  const { rows, count } = await Listing.findAndCountAll({
    where: { farmer_id: farmer.id },
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { listings: rows, total: count };
};

const searchListings = async (searchQuery, limit = 10, offset = 0) => {
  const { rows, count } = await Listing.findAndCountAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { crop_name: { [sequelize.Sequelize.Op.iLike]: `%${searchQuery}%` } },
        { description: { [sequelize.Sequelize.Op.iLike]: `%${searchQuery}%` } },
        { variety: { [sequelize.Sequelize.Op.iLike]: `%${searchQuery}%` } },
      ],
      is_active: true,
    },
    include: [
      {
        model: Farmer,
        as: 'farmer',
        include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'mobile'] }],
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { listings: rows, total: count };
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getFarmerListings,
  searchListings,
};
