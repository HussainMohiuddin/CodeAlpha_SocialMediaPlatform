const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createPost, getFeed, getPost, toggleLike, deletePost } = require('../controllers/postController');
const { addComment, getComments } = require('../controllers/commentController');

const router = express.Router();

router.get('/', optionalAuth, asyncHandler(getFeed));
router.post('/', protect, asyncHandler(createPost));
router.get('/:id', optionalAuth, asyncHandler(getPost));
router.delete('/:id', protect, asyncHandler(deletePost));
router.post('/:id/like', protect, asyncHandler(toggleLike));
router.get('/:postId/comments', asyncHandler(getComments));
router.post('/:postId/comments', protect, asyncHandler(addComment));

module.exports = router;
