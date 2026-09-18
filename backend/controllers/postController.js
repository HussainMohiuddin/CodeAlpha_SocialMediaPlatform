const Post = require('../models/Post');
const Comment = require('../models/Comment');

function serializePost(post, viewerId) {
  const liked = viewerId ? post.likes.some((id) => id.toString() === viewerId.toString()) : false;
  return {
    id: post._id,
    author: post.author,
    content: post.content,
    likeCount: post.likes.length,
    commentCount: post.commentCount,
    liked,
    createdAt: post.createdAt,
  };
}

async function createPost(req, res) {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Post content is required' });
  }

  const post = await Post.create({ author: req.user._id, content: content.trim() });
  await post.populate('author', 'name username avatarColor');

  res.status(201).json({ post: serializePost(post, req.user._id) });
}

async function getFeed(req, res) {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('author', 'name username avatarColor');

  const viewerId = req.user ? req.user._id : null;
  res.json({ posts: posts.map((p) => serializePost(p, viewerId)) });
}

async function getPost(req, res) {
  const post = await Post.findById(req.params.id).populate('author', 'name username avatarColor');
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json({ post: serializePost(post, req.user && req.user._id) });
}

async function toggleLike(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));
  if (alreadyLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  await post.populate('author', 'name username avatarColor');

  res.json({ post: serializePost(post, req.user._id) });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (!post.author.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted' });
}

module.exports = { createPost, getFeed, getPost, toggleLike, deletePost, serializePost };
