const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarColor: user.avatarColor,
    followerCount: user.followers ? user.followers.length : 0,
    followingCount: user.following ? user.following.length : 0,
  };
}

async function register(req, res) {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, username, email and password are all required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ message: 'Username must be 3-20 characters (letters, numbers, underscore only)' });
  }

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email or username already exists' });
  }

  const user = await User.create({ name, username, email, password });
  const token = generateToken(user._id);

  res.status(201).json({ user: sanitizeUser(user), token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({ user: sanitizeUser(user), token });
}

async function getProfile(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { register, login, getProfile, sanitizeUser };
