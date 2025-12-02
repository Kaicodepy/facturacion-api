const Factura = require('../models/Factura');
const Cliente = require('../models/Cliente');
const { generarPDF } = require('../utils/pdfGenerator');
const axios = require('axios');

// Calcular totales
const calcularTotales = (items) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio_unitario);
  }, 0);

  const impuestos = subtotal * 0.16; // 16% IVA (ajustar según país)
  const total = subtotal + impuestos;

  return { subtotal, impuestos, total };
};

// Generar número de factura
const generarNumeroFactura = async () => {
  const ultimaFactura = await Factura.findOne({
    order: [['createdAt', 'DESC']]
  });

  if (!ultimaFactura) {
    return 'FAC-0001';
  }

  const ultimoNumero = parseInt(ultimaFactura.numero.split('-')[1]);
  return `FAC-${String(ultimoNumero + 1).padStart(4, '0')}`;
};

// Timbrar factura con API externa (ejemplo)
const timbrarFactura = async (facturaData) => {
  try {
    // Simulación de llamada a API fiscal
    const response = await axios.post(
      `${process.env.FISCAL_API_URL}/timbrar`,
      facturaData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FISCAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.folio_fiscal;
  } catch (error) {
    console.error('Error al timbrar:', error.message);
    return null;
  }
};

// Obtener todas las facturas
exports.getFacturas = async (req, res) => {
  try {
    const { estado, clienteId } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;

    const facturas = await Factura.findAll({
      where,
      include: [{
        model: Cliente,
        attributes: ['id', 'nombre', 'email', 'rfc_cuit']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: facturas,
      count: facturas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// Obtener factura por ID
exports.getFacturaById = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [{
        model: Cliente,
        attributes: ['nombre', 'email', 'rfc_cuit', 'direccion']
      }]
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura',
      error: error.message
    });
  }
};

// Crear nueva factura
exports.createFactura = async (req, res) => {
  try {
    const { clienteId, items, notas } = req.body;

    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Calcular subtotales de cada item
    const itemsConSubtotal = items.map(item => ({
      ...item,
      subtotal: item.cantidad * item.precio_unitario
    }));

    // Calcular totales
    const { subtotal, impuestos, total } = calcularTotales(itemsConSubtotal);

    // Generar número de factura
    const numero = await generarNumeroFactura();

    // Crear factura
    const factura = await Factura.create({
      numero,
      clienteId,
      items: itemsConSubtotal,
      subtotal,
      impuestos,
      total,
      notas
    });

    // Timbrar factura (opcional, puede fallar)
    const folioFiscal = await timbrarFactura({
      numero: factura.numero,
      cliente: cliente.rfc_cuit,
      total: factura.total
    });

    if (folioFiscal) {
      await factura.update({ folio_fiscal: folioFiscal });
    }

    // Cargar la factura completa con el cliente
    const facturaCompleta = await Factura.findByPk(factura.id, {
      include: [Cliente]
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: facturaCompleta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear factura',
      error: error.message
    });
  }
};

// Actualizar estado de factura
exports.updateEstadoFactura = async (req, res) => {
  try {
    const { estado } = req.body;
    const factura = await Factura.findByPk(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    await factura.update({ estado });

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: factura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// Generar PDF de factura
exports.generarPDFFactura = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [Cliente]
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    const pdfBuffer = await generarPDF(factura);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${factura.numero}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message
    });
  }
};