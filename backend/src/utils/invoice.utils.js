const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, items, farmer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Kisan Connect', { align: 'center' });
    doc.fontSize(10).text('Direct Farm-to-Consumer Marketplace', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice — Order #${order.id.slice(0, 8)}`);
    doc.fontSize(10).text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`);
    doc.moveDown();

    doc.fontSize(12).text('Items:');
    doc.moveDown(0.5);

    items.forEach((item) => {
      doc.fontSize(10).text(
        `${item.crop_name} — ${item.quantity_kg}kg × ₹${item.price_per_kg} = ₹${item.total_price}`
      );
    });

    doc.moveDown();
    doc.fontSize(10).text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Delivery: ₹${order.delivery_charge}`);
    doc.text(`GST: ₹${order.gst_amount}`);
    doc.fontSize(12).text(`Total: ₹${order.total_amount}`, { underline: true });

    doc.moveDown(2);
    doc.fontSize(8).text('This is a computer-generated invoice.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };
