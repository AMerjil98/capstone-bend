const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
})

const UserSchema = new Schema({
    username: {type: String, required: true, min: 4, unique: true},
    password: {type: String, required: true},
    role: {
        type: String, 
        enum: ["User", "Admin", "Owner"],
        default: 'User',
    },
    comments: [CommentSchema],
});

const AdminSchema = new Schema({
    deletedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post'}],
});

const OwnerSchema = new Schema({
   canRemoveUsers: { type: Boolean, default: true },
})

const UserModel = model('User', UserSchema);
const AdminModel = model('Admin', AdminSchema);
const OwnerModel = model('Owner', OwnerSchema);

module.exports = {
    UserModel,
    AdminModel,
    OwnerModel,
};