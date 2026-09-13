const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', scheduleController.getSchedule);
router.post('/', scheduleController.addScheduleItem);
router.delete('/:id', scheduleController.deleteScheduleItem);
router.get('/workload', scheduleController.getWorkload);

module.exports = router;
