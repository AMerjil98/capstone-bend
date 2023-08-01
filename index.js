const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const Post = require('./models/Post');
const app = express();
const fs = require('fs');

app.use(cors({
  origin:'http://localhost:3000'
}));
app.use(express.json());

mongoose.connect('mongodb+srv://blog:N6fsuob5vAGoHiqM@cluster0.c2ehsy8.mongodb.net/?retryWrites=true&w=majority');

app.post('/post', async (req,res) => {
  const {title,summary,content} = req.body;
  const postDoc = await Post.create({
    title,
    summary,
    content,
  });
  res.json(postDoc);
});

app.put('/post/:id', async (req,res) => {
  const { title,summary,content } = req.body;
  const postId = req.params.id;
  try {
    const postDoc = await Post.findByIdAndUpdate(
      postId,
      { title, summary, content },
      {new: true}
    );
    if (!postDoc) {
      return res.status(404).json({ error: "Post not found"});
    }
    res.json(postDoc);
  } catch (e) {
    console.error('Error updating post: ', e);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id);
  res.json(postDoc);
});

app.delete('/post/:id', async (req,res) => {
  const id = req.params.id;
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (e) {
    console.error('Error deleting post: ', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(4000);
//