require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const users = [
  { name: 'Ayesha Khan', username: 'ayesha', email: 'ayesha@example.com', password: 'password123', bio: 'Designer & coffee enthusiast ☕', avatarColor: '#ff7a45' },
  { name: 'Bilal Ahmed', username: 'bilal', email: 'bilal@example.com', password: 'password123', bio: 'Full-stack developer', avatarColor: '#2f6fed' },
  { name: 'Sara Malik', username: 'sara', email: 'sara@example.com', password: 'password123', bio: 'Traveler ✈️ | Photographer', avatarColor: '#22c55e' },
];

const posts = [
  { username: 'ayesha', content: 'Just redesigned my portfolio site — feels so good to finally ship it! 🎉' },
  { username: 'bilal', content: 'Debugging a race condition for 3 hours only to find a missing await. Classic.' },
  { username: 'sara', content: 'Sunrise over the mountains this morning was unreal. Sometimes you just have to stop and look up.' },
  { username: 'ayesha', content: 'Coffee shop playlist recommendations? Need something chill for deep work.' },
  { username: 'bilal', content: 'Shipped a new feature today using WebSockets for the first time — real-time updates are addictive.' },
];

const comments = [
  { postIndex: 0, username: 'bilal', text: 'Looks amazing! Love the new layout.' },
  { postIndex: 0, username: 'sara', text: 'Congrats on shipping! 🎉' },
  { postIndex: 1, username: 'ayesha', text: 'We\'ve all been there 😂' },
  { postIndex: 2, username: 'ayesha', text: 'Gorgeous shot!' },
];

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);

  const createdUsers = {};
  for (const u of users) {
    createdUsers[u.username] = await User.create(u);
  }

  // ayesha and sara follow bilal; bilal follows ayesha
  const ayesha = createdUsers.ayesha;
  const bilal = createdUsers.bilal;
  const sara = createdUsers.sara;

  bilal.followers.push(ayesha._id, sara._id);
  ayesha.following.push(bilal._id);
  sara.following.push(bilal._id);
  ayesha.followers.push(bilal._id);
  bilal.following.push(ayesha._id);

  await bilal.save();
  await ayesha.save();
  await sara.save();

  const createdPosts = [];
  for (const p of posts) {
    const author = createdUsers[p.username];
    const post = await Post.create({ author: author._id, content: p.content });
    createdPosts.push(post);
  }

  // A few likes
  createdPosts[0].likes.push(bilal._id, sara._id);
  createdPosts[2].likes.push(ayesha._id, bilal._id);
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
  console.log('Sample login: ayesha@example.com / password123');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
