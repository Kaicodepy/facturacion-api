const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { validateCliente } = require('../middleware/validateData');
const auth = require('../middleware/auth');

// Rutas protegidas con auth (descomentar cuando implementes autenticación)
// router.use(auth);

router.get('/', clientesController.getClientes);
router.get('/:id', clientesController.getClienteById);
router.post('/', validateCliente, clientesController.createCliente);
router.put('/:id', validateCliente, clientesController.updateCliente);
router.delete('/:id', clientesController.deleteCliente);

module.exports = router;