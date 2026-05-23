const express = require('express');
const router = express.Router();
const { createCatalyst, listCatalysts, verifyCatalyst } = require('../controllers/catalystController');

router.post('/', createCatalyst);
router.get('/', listCatalysts);
router.patch('/:id/verify', verifyCatalyst);

module.exports = router;
