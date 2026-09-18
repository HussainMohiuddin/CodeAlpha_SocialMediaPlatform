const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { getUserByUsername, updateProfile, followUser, getUserPosts } = require('../controllers/userController');

const router = express.Router();

router.get('/:username', optionalAuth, asyncHandler(getUserByUsername));
router.get('/:username/posts', optionalAuth, asyncHandler(getUserPosts));
router.put('/me/profile', protect, asyncHandler(updateProfile));
router.post('/:username/follow', protect, asyncHandler(followUser));

module.exports = router;
