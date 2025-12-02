const express = require('express');
const router = express.Router();
const facturasController = require('../controllers/facturasController');
const { validateFactura } = require('../middleware/validateData');
const auth = require('../middleware/auth');

// router.use(auth);

router.get('/', facturasController.getFacturas);
router.get('/:id', facturasController.getFacturaById);
router.post('/', validateFactura, facturasController.createFactura);
router.patch('/:id/estado', facturasController.updateEstadoFactura);
router.get('/:id/pdf', facturasController.generarPDFFactura);

module.exports = router;