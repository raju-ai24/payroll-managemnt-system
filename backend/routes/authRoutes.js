const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, getUsers, updateOrganization } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { isAnyAdmin } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.put('/organization', protect, updateOrganization);
router.get('/users', protect, isAnyAdmin, getUsers);

module.exports = router;
