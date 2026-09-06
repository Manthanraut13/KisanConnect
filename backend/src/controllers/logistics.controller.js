const logisticsService = require('../services/logistics.service');
const { cloudinary } = require('../config/cloudinary.config');
const { successResponse } = require('../utils/response.utils');

const uploadProofImage = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kisan-connect/delivery-proof', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(file.buffer);
  });
};

const assignDriver = async (req, res, next) => {
  try {
    const result = await logisticsService.assignDriver(req.params.orderId);
    return successResponse(res, 'Driver assignment processed', result);
  } catch (err) {
    next(err);
  }
};

const getDriverAssignments = async (req, res, next) => {
  try {
    const assignments = await logisticsService.getDriverAssignments(req.user.id);
    return successResponse(res, 'Assignments fetched successfully', assignments);
  } catch (err) {
    next(err);
  }
};

const startDelivery = async (req, res, next) => {
  try {
    const assignment = await logisticsService.startDelivery(req.params.id, req.user.id);
    return successResponse(res, 'Delivery started', assignment);
  } catch (err) {
    next(err);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    let proofUrl = null;
    if (req.file) proofUrl = await uploadProofImage(req.file);
    const assignment = await logisticsService.confirmDelivery(req.params.id, req.user.id, proofUrl);
    return successResponse(res, 'Delivery confirmed', assignment);
  } catch (err) {
    next(err);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const assignment = await logisticsService.trackOrder(req.params.orderId);
    return successResponse(res, 'Tracking info fetched', assignment);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, lat, lng } = req.body;
    const driver = await logisticsService.updateDriverStatus(req.user.id, status, lat, lng);
    return successResponse(res, 'Driver status updated', driver);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  assignDriver,
  getDriverAssignments,
  startDelivery,
  confirmDelivery,
  trackOrder,
  updateStatus,
};