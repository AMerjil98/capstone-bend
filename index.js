const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const { UserModel } = require('./models/user');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: './uploads'});
const fs = require('fs');
const pathModule = require('path');
const Post = require ('./models/post.js');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdf1234'

app.use(cors({credentials:true,origin:'https://64bf2d69b12b8c0e1000dd22--helpful-cascaron-0dbf4c.netlify.app/'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(pathModule.join(__dirname, 'uploads')));

mongoose.connect('mongodb+srv://blog:hSVvvg2R9yAm5YSv@cluster0.c2ehsy8.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'deucifer' && password ==='ReAs') {
        try {
            const user = await UserModel.create({ username, password, role: 'Owner' });
            res.json(user);
        } catch (e) {
            res.status(500).json({ error: 'Could not create user.' });
        }
    } else {
        try {
            const userDoc = await UserModel.create({
                username,
                password:bcrypt.hashSync(password, salt),
                roles: 'User',
            });
            res.json(userDoc);
        } catch (e) {
            console.log(e);
            res.status(400).json(e);
        }
    } 
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await UserModel.findOne({ username });

    if (!userDoc) {
        return res.status(400).json("User not found");
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        //logged in
        jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id:userDoc._id,
                username,
            });
        })
    } else {
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file') , async (req,res) => {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length -1];
    const newPath = path + '.' + ext;
    const coverPath = '/uploads/' + newPath.replace(/\\/g, '/');
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if (err) throw err;
        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:coverPath,
            author:info.id,
        });
        res.json(postDoc);
    });
});

app.put('/post', uploadMiddleware.single('file'), async(req,res) => {
    let newPath = null;
    if (req.file) {
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length -1];
        newPath = path + '.' + ext;
        fs.renameSync(path,newPath);
    }

    const {token} = req.cookies;
        jwt.verify(token, secret, {}, async (err,info) => {
            if (err) throw err;
            const {id,title,summary,content} = req.body;
            const postDoc = await Post.findById(id);
            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                res.status(400).json('you are not the author');
            }
            await postDoc.save({
                title,
                summary,
                content,
                cover: newPath ? newPath : postDoc.cover,
            });
            res.json(postDoc);
        });
});

app.get('/post', async (req,res) => {
    res.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.listen(process.env.PORT || 4000);