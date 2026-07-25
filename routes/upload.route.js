const exxpress = require('express');
const router = exxpress.Router();
const uploadController = require('../controller/upload.controller');

router.post('/upload', uploadController.uploadFile);
router.delete('/remove', uploadController.removeFile);

module.exports = router;