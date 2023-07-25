const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    username: {type: String, required: true, min: 4, unique: true},
    password: {type: String, required: true},
    role: {
        type: String, 
        enum: ["User", "Admin", "Owner"],
        default: 'User',
    },
});

const AdminSchema = new Schema({
    username: {type: String, required: true, min: 4, unique: true},
    password: {type: String, required: true},
    role: {
        type: String, 
        enum: ["User", "Admin", "Owner"],
        default: 'Admin',
    },
    canPost: { type: Boolean, default: true },
});

const OwnerSchema = new Schema({
    username: {type: String, required: true, min: 4, unique: true},
    password: {type: String, required: true},
    role: {
        type: String, 
        enum: ["User", "Admin", "Owner"],
        default: 'Owner',
    },
    canPost: { type: Boolean, default: true },
    deletedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post'}],
    canRemoveUsers: { type: Boolean, default: true },
})

const UserModel = mongoose.model('User', UserSchema);
const AdminModel = mongoose.model('Admin', AdminSchema);
const OwnerModel = mongoose.model('Owner', OwnerSchema);

module.exports = {
    UserModel,
    AdminModel,
    OwnerModel,
};