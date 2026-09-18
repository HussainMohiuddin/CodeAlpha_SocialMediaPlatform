const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function addComment(req, res) {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comment = await Comment.create({ post: post._id, author: req.user._id, text: text.trim() });
  await comment.populate('author', 'name username avatarColor');

  post.commentCount += 1;
  await post.save();

  res.status(201).json({ comment });
}

async function getComments(req, res) {
  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: 1 })
    .populate('author', 'name username avatarColor');

  res.json({ comments });
}

async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (!comment.author.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own comments' });
  }

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

  res.json({ message: 'Comment deleted' });
}

module.exports = { addComment, getComments, deleteComment };
