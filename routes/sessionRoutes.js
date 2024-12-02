const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.startSession);
router.put('/extend', sessionController.extendSession);
router.get('/me', sessionController.getUserSessions);


module.exports = router;

