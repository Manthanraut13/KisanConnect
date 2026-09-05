const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  const qrData = typeof data === 'string' ? data : JSON.stringify(data);
  const dataUrl = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
  return dataUrl;
};

module.exports = { generateQRCode };
