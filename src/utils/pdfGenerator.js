const PDFDocument = require('pdfkit');

const generarPDF = (factura) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('FACTURA', { align: 'center' });
      doc.moveDown();

      // Info de la factura
      doc.fontSize(10);
      doc.text(`Número: ${factura.numero}`, { align: 'right' });
      doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString()}`, { align: 'right' });
      if (factura.folio_fiscal) {
        doc.text(`Folio Fiscal: ${factura.folio_fiscal}`, { align: 'right' });
      }
      doc.moveDown();

      // Info del cliente
      doc.fontSize(12).text('CLIENTE:', { underline: true });
      doc.fontSize(10);
      doc.text(`Nombre: ${factura.Cliente.nombre}`);
      doc.text(`RFC/CUIT: ${factura.Cliente.rfc_cuit}`);
      doc.text(`Email: ${factura.Cliente.email}`);
      if (factura.Cliente.direccion) {
        doc.text(`Dirección: ${factura.Cliente.direccion}`);
      }
      doc.moveDown(2);

      // Tabla de items
      const tableTop = doc.y;
      const itemX = 50;
      const descX = 150;
      const cantX = 350;
      const precioX = 420;
      const totalX = 490;

      // Headers de la tabla
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('#', itemX, tableTop);
      doc.text('Descripción', descX, tableTop);
      doc.text('Cant.', cantX, tableTop);
      doc.text('Precio', precioX, tableTop);
      doc.text('Total', totalX, tableTop);

      doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Items
      doc.font('Helvetica');
      let yPos = tableTop + 25;

      factura.items.forEach((item, index) => {
        doc.text(index + 1, itemX, yPos);
        doc.text(item.descripcion, descX, yPos, { width: 180 });
        doc.text(item.cantidad.toString(), cantX, yPos);
        doc.text(`$${parseFloat(item.precio_unitario).toFixed(2)}`, precioX, yPos);
        doc.text(`$${parseFloat(item.subtotal).toFixed(2)}`, totalX, yPos);
        yPos += 25;
      });

      // Totales
      doc.moveDown(2);
      const totalesX = 400;
      yPos = doc.y;

      doc.text('Subtotal:', totalesX, yPos);
      doc.text(`$${parseFloat(factura.subtotal).toFixed(2)}`, totalesX + 100, yPos, { align: 'right' });

      yPos += 20;
      doc.text('Impuestos:', totalesX, yPos);
      doc.text(`$${parseFloat(factura.impuestos).toFixed(2)}`, totalesX + 100, yPos, { align: 'right' });

      yPos += 20;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('TOTAL:', totalesX, yPos);
      doc.text(`$${parseFloat(factura.total).toFixed(2)}`, totalesX + 100, yPos, { align: 'right' });

      // Notas
      if (factura.notas) {
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica');
        doc.text('Notas:', { underline: true });
        doc.text(factura.notas);
      }

      // Footer
      doc.fontSize(8);
      doc.text(
        'Gracias por su preferencia',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generarPDF };