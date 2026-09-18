require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const users = [
  { name: 'Maria Santos', username: 'maria', email: 'maria@example.com', password: 'password123', bio: 'UX designer & coffee enthusiast ☕', avatarColor: '#ff7a45' },
  { name: 'David Okafor', username: 'david', email: 'david@example.com', password: 'password123', bio: 'Full-stack developer', avatarColor: '#2f6fed' },
  { name: 'Priya Nair', username: 'priya', email: 'priya@example.com', password: 'password123', bio: 'Traveler ✈️ | Photographer', avatarColor: '#22c55e' },
];

const posts = [
  { username: 'maria', content: 'Just redesigned my portfolio site — feels so good to finally ship it! 🎉' },
  { username: 'david', content: 'Debugging a race condition for 3 hours only to find a missing await. Classic.' },
  { username: 'priya', content: 'Sunrise over the mountains this morning was unreal. Sometimes you just have to stop and look up.' },
  { username: 'maria', content: 'Coffee shop playlist recommendations? Need something chill for deep work.' },
  { username: 'david', content: 'Shipped a new feature today using WebSockets for the first time — real-time updates are addictive.' },
];

const comments = [
  { postIndex: 0, username: 'david', text: 'Looks amazing! Love the new layout.' },
  { postIndex: 0, username: 'priya', text: 'Congrats on shipping! 🎉' },
  { postIndex: 1, username: 'maria', text: 'We\'ve all been there 😂' },
  { postIndex: 2, username: 'maria', text: 'Gorgeous shot!' },
];

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);

  const createdUsers = {};
  for (const u of users) {
    createdUsers[u.username] = await User.create(u);
  }

  // maria and priya follow david; david follows maria
  const maria = createdUsers.maria;
  const david = createdUsers.david;
  const priya = createdUsers.priya;

  david.followers.push(maria._id, priya._id);
  maria.following.push(david._id);
  priya.following.push(david._id);
  maria.followers.push(david._id);
  david.following.push(maria._id);

  await david.save();
  await maria.save();
  await priya.save();

  const createdPosts = [];
  for (const p of posts) {
    const author = createdUsers[p.username];
    const post = await Post.create({ author: author._id, content: p.content });
    createdPosts.push(post);
  }

  // A few likes
  createdPosts[0].likes.push(david._id, priya._id);
  createdPosts[2].likes.push(maria._id, david._id);
  await createdPosts[0].save();
  await createdPosts[2].save();

  for (const c of comments) {
    const author = createdUsers[c.username];
    const post = createdPosts[c.postIndex];
    await Comment.create({ post: post._id, author: author._id, text: c.text });
    post.commentCount += 1;
    await post.save();
  }

  console.log(`Seeded ${users.length} users, ${posts.length} posts, ${comments.length} comments.`);
  console.log('Sample login: maria@example.com / password123');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
