const User = require('../models/User');
const Post = require('../models/Post');
const { serializePost } = require('./postController');

function publicProfile(user, viewerId) {
  const isFollowing = viewerId
    ? user.followers.some((f) => f.toString() === viewerId.toString())
    : false;
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatarColor: user.avatarColor,
    followerCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing,
    createdAt: user.createdAt,
  };
}

async function getUserByUsername(req, res) {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user: publicProfile(user, req.user && req.user._id) });
}

async function updateProfile(req, res) {
  const { name, bio, avatarColor } = req.body;

  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio.slice(0, 200);
  if (avatarColor !== undefined) req.user.avatarColor = avatarColor;

  await req.user.save();
  res.json({ user: publicProfile(req.user, req.user._id) });
}

async function followUser(req, res) {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (target._id.equals(req.user._id)) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  const alreadyFollowing = target.followers.some((f) => f.equals(req.user._id));
  if (alreadyFollowing) {
    target.followers.pull(req.user._id);
    req.user.following.pull(target._id);
  } else {
    target.followers.push(req.user._id);
    req.user.following.push(target._id);
  }

  await target.save();
  await req.user.save();

  res.json({ user: publicProfile(target, req.user._id) });
}

async function getUserPosts(req, res) {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate('author', 'name username avatarColor');

  const viewerId = req.user ? req.user._id : null;
  res.json({ posts: posts.map((p) => serializePost(p, viewerId)) });
}

module.exports = { getUserByUsername, updateProfile, followUser, getUserPosts, publicProfile };
