const express = require('express');
const router = express.Router();
const uploadController = require('../controller/upload.controller');

router.post('/upload', uploadController.uploadFile);
router.delete('/remove', uploadController.removeFile);

module.exports = router;
