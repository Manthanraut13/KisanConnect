const listingService = require('../services/listing.service');
const { cloudinary } = require('../config/cloudinary.config');
const { successResponse, errorResponse } = require('../utils/response.utils');

// Helper: upload images to cloudinary from memory buffer
const uploadImages = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'kisan-connect/listings', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      stream.end(file.buffer);
    });
  });
  return Promise.all(uploadPromises);
};

const createListing = async (req, res, next) => {
  try {
    const imageUrls = await uploadImages(req.files);
    const listing = await listingService.createListing(req.body, req.user.id, imageUrls);
    return successResponse(res, 'Listing created successfully', listing, 201);
  } catch (err) {
    next(err);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, ...filters } = req.query;
    const offset = (page - 1) * limit;
    const { listings, total } = await listingService.getListings(filters, Number(limit), Number(offset));
    return successResponse(res, 'Listings fetched successfully', listings, 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    return successResponse(res, 'Listing fetched successfully', listing);
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(req.params.id, req.user.id, req.body);
    return successResponse(res, 'Listing updated successfully', listing);
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    await listingService.deleteListing(req.params.id, req.user.id);
    return successResponse(res, 'Listing deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getFarmerListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { listings, total } = await listingService.getFarmerListings(req.user.id, Number(limit), Number(offset));
    return successResponse(res, 'Your listings fetched successfully', listings, 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

const searchListings = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) return errorResponse(res, 'Search query is required', 400);
    const offset = (page - 1) * limit;
    const { listings, total } = await listingService.searchListings(q, Number(limit), Number(offset));
    return successResponse(res, 'Search results fetched successfully', listings, 200, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (err) {
    next(err);
  }
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