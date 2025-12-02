const { body, validationResult } = require('express-validator');

const validateCliente = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('rfc_cuit').trim().notEmpty().withMessage('RFC/CUIT es requerido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateFactura = [
  body('clienteId').isUUID().withMessage('Cliente ID inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.descripcion').notEmpty().withMessage('Descripción requerida'),
  body('items.*.cantidad').isFloat({ min: 0.01 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.precio_unitario').isFloat({ min: 0 }).withMessage('Precio inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateCliente, validateFactura };