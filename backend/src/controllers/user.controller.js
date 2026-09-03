const { User, Farmer, BulkBuyer, LogisticsPartner } = require('../models');
const { cloudinary } = require('../config/cloudinary.config');
const AppError = require('../utils/AppError');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_verified', 'is_active', 'profile_image', 'preferred_lang'],
      include: [
        { model: Farmer, as: 'farmerProfile', required: false },
        { model: BulkBuyer, as: 'bulkBuyerProfile', required: false },
        { model: LogisticsPartner, as: 'logisticsProfile', required: false },
      ],
    });

    return res.json({ success: true, message: 'Profile fetched', data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { full_name, email, preferred_lang } = req.body;
    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email;
    if (preferred_lang) updates.preferred_lang = preferred_lang;

    await req.user.update(updates);
    return res.json({ success: true, message: 'Profile updated', data: updates });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No image uploaded', 400);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'kisan-connect/profiles', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(req.file.buffer);
    });

    await req.user.update({ profile_image: result.secure_url });
    return res.json({ success: true, message: 'Profile image uploaded', data: { url: result.secure_url } });
  } catch (error) {
    next(error);
  }
};

const completeProfile = async (req, res, next) => {
  try {
    const body = req.body;
    const userId = req.user.id;

    if (req.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ where: { user_id: userId } });
      if (!farmer) throw new AppError('Farmer profile not found', 404);
      await farmer.update({
        aadhaar_hash: body.aadhaar_hash || farmer.aadhaar_hash,
        bank_account: body.bank_account || farmer.bank_account,
        bank_ifsc: body.bank_ifsc || farmer.bank_ifsc,
        bank_name: body.bank_name || farmer.bank_name,
        village: body.village || farmer.village,
        taluka: body.taluka || farmer.taluka,
        district: body.district || farmer.district,
        state: body.state || farmer.state,
        pin_code: body.pin_code || farmer.pin_code,
        latitude: body.latitude ?? farmer.latitude,
        longitude: body.longitude ?? farmer.longitude,
        land_area_acres: body.land_area_acres ?? farmer.land_area_acres,
        is_kyc_done: body.is_kyc_done ?? farmer.is_kyc_done,
      });
      await req.user.update({ is_verified: true });
      return res.json({ success: true, message: 'Farmer profile completed' });
    }

    if (req.user.role === 'bulk_buyer') {
      const buyer = await BulkBuyer.findOne({ where: { user_id: userId } });
      if (!buyer) throw new AppError('Bulk buyer profile not found', 404);
      await buyer.update({
        business_name: body.business_name || buyer.business_name,
        gstin: body.gstin || buyer.gstin,
        business_type: body.business_type || buyer.business_type,
        district: body.district || buyer.district,
        state: body.state || buyer.state,
        is_verified: body.is_verified ?? buyer.is_verified,
      });
      await req.user.update({ is_verified: true });
      return res.json({ success: true, message: 'Bulk buyer profile completed' });
    }

    if (req.user.role === 'logistics') {
      const partner = await LogisticsPartner.findOne({ where: { user_id: userId } });
      if (!partner) throw new AppError('Logistics profile not found', 404);
      await partner.update({
        vehicle_type: body.vehicle_type || partner.vehicle_type,
        vehicle_number: body.vehicle_number || partner.vehicle_number,
        license_number: body.license_number || partner.license_number,
        district: body.district || partner.district,
        state: body.state || partner.state,
        is_verified: body.is_verified ?? partner.is_verified,
      });
      await req.user.update({ is_verified: true });
      return res.json({ success: true, message: 'Logistics profile completed' });
    }

    throw new AppError('Profile completion not supported for this role', 400);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage, completeProfile };
