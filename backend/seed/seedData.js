require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const users = [
  { name: 'Hassan Mohiuddin', username: 'hassan', email: 'hassan@example.com', password: 'password123', bio: 'UX designer & coffee enthusiast ☕', avatarColor: '#ff7a45' },
  { name: 'Hamza Malik', username: 'hamza', email: 'hamza@example.com', password: 'password123', bio: 'Full-stack developer', avatarColor: '#2f6fed' },
  { name: 'Kamran', username: 'kamran', email: 'kamran@example.com', password: 'password123', bio: 'Traveler ✈️ | Photographer', avatarColor: '#22c55e' },
  { name: 'Daniyal Malik', username: 'daniyal', email: 'daniyal@example.com', password: 'password123', bio: 'Music producer 🎧 | Coffee addict', avatarColor: '#8b5cf6' },
];

// [followerUsername, followingUsername]
const follows = [
  ['hassan', 'hamza'],
  ['hassan', 'daniyal'],
  ['kamran', 'hamza'],
  ['daniyal', 'hassan'],
  ['daniyal', 'hamza'],
];

const posts = [
  { username: 'hassan', content: 'Just redesigned my portfolio site — feels so good to finally ship it! 🎉' },
  { username: 'hamza', content: 'Debugging a race condition for 3 hours only to find a missing await. Classic.' },
  { username: 'kamran', content: 'Sunrise over the mountains this morning was unreal. Sometimes you just have to stop and look up.' },
  { username: 'hassan', content: 'Coffee shop playlist recommendations? Need something chill for deep work.' },
  { username: 'hamza', content: 'Shipped a new feature today using WebSockets for the first time — real-time updates are addictive.' },
  { username: 'daniyal', content: "Finally mixed down that track I've been working on for weeks 🎧 feedback welcome!" },
];

const comments = [
  { postIndex: 0, username: 'hamza', text: 'Looks amazing! Love the new layout.' },
  { postIndex: 0, username: 'kamran', text: 'Congrats on shipping! 🎉' },
  { postIndex: 1, username: 'hassan', text: "We've all been there 😂" },
  { postIndex: 2, username: 'hassan', text: 'Gorgeous shot!' },
  { postIndex: 5, username: 'hamza', text: 'This slaps! 🔥' },
];

const likes = [
  { postIndex: 0, usernames: ['hamza', 'kamran'] },
  { postIndex: 2, usernames: ['hassan', 'hamza'] },
  { postIndex: 5, usernames: ['hassan', 'kamran'] },
];

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);

  const createdUsers = {};
  for (const u of users) {
    createdUsers[u.username] = await User.create(u);
  }

  for (const [followerName, followingName] of follows) {
    const follower = createdUsers[followerName];
    const following = createdUsers[followingName];
    following.followers.push(follower._id);
    follower.following.push(following._id);
  }
  await Promise.all(Object.values(createdUsers).map((u) => u.save()));

  const createdPosts = [];
  for (const p of posts) {
    const author = createdUsers[p.username];
    const post = await Post.create({ author: author._id, content: p.content });
    createdPosts.push(post);
  }

  for (const like of likes) {
    const post = createdPosts[like.postIndex];
    post.likes.push(...like.usernames.map((username) => createdUsers[username]._id));
    await post.save();
  }

  for (const c of comments) {
    const author = createdUsers[c.username];
    const post = createdPosts[c.postIndex];
    await Comment.create({ post: post._id, author: author._id, text: c.text });
    post.commentCount += 1;
    await post.save();
  }

  console.log(`Seeded ${users.length} users, ${posts.length} posts, ${comments.length} comments.`);
  console.log('Sample login: hassan@example.com / password123');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
