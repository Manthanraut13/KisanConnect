const Joi = require('joi');

const createListingSchema = Joi.object({
  crop_name: Joi.string().min(2).max(100).required(),
  crop_category: Joi.string().max(50).optional(),
  variety: Joi.string().max(100).optional(),
  quantity_kg: Joi.number().positive().required(),
  price_per_kg: Joi.number().positive().required(),
  min_order_kg: Joi.number().positive().optional(),
  quality_grade: Joi.string().valid('A', 'B', 'C').optional(),
  harvest_date: Joi.date().required(),
  expiry_date: Joi.date().optional(),
  description: Joi.string().max(500).optional(),
  is_organic: Joi.boolean().optional(),
  district: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const updateListingSchema = Joi.object({
  quantity_kg: Joi.number().positive().optional(),
  price_per_kg: Joi.number().positive().optional(),
  min_order_kg: Joi.number().positive().optional(),
  quality_grade: Joi.string().valid('A', 'B', 'C').optional(),
  expiry_date: Joi.date().optional(),
  description: Joi.string().max(500).optional(),
  is_active: Joi.boolean().optional(),
});

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        listing_id: Joi.string().uuid().required(),
        quantity_kg: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
  delivery_address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pin_code: Joi.string().length(6).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  delivery_slot: Joi.date().optional(),
  notes: Joi.string().max(500).optional(),
});

const bulkOrderSchema = Joi.object({
  crop_name: Joi.string().min(2).max(100).required(),
  required_quantity_kg: Joi.number().positive().required(),
  preferred_quality: Joi.string().valid('A', 'B', 'C').optional(),
  required_by_date: Joi.date().required(),
  delivery_location: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pin_code: Joi.string().length(6).required(),
  }).required(),
  notes: Joi.string().max(500).optional(),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  createOrderSchema,
  bulkOrderSchema,
};
