const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.delete('/:id', protect, asyncHandler(deleteComment));

module.exports = router;
