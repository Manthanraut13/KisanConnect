const { Listing } = require('../models');

const STATE_CODES = {
  'Maharashtra': 'MH', 'Punjab': 'PB', 'Tamil Nadu': 'TN', 'Karnataka': 'KA',
  'Andhra Pradesh': 'AP', 'Rajasthan': 'RJ', 'Madhya Pradesh': 'MP',
  'Uttar Pradesh': 'UP', 'Gujarat': 'GJ', 'Bihar': 'BR'
};

const DISTRICT_CODES = {
  'Nashik': 'NAS', 'Pune': 'PUN', 'Amritsar': 'AMR', 'Ludhiana': 'LUD',
  'Coimbatore': 'CBE', 'Mysuru': 'MYS', 'Guntur': 'GNT', 'Jaipur': 'JPR',
  'Indore': 'IND', 'Varanasi': 'VNS'
};

// Generates unique lot number: KC-2026-MH-NAS-00001
const generateLotNumber = async (state, district) => {
  const year = new Date().getFullYear();
  const stateCode = STATE_CODES[state] || 'XX';
  const distCode = DISTRICT_CODES[district] || 'XXX';
  const count = await Listing.count({ where: { district } });
  const seq = String(count + 1).padStart(5, '0');
  return `KC-${year}-${stateCode}-${distCode}-${seq}`;
};

module.exports = { generateLotNumber };