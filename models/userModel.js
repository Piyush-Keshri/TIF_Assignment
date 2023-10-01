const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    id: String,

    username: {
        type: String,
        required: [true, "Please Enter Username"]
    },
    email: {
        type: String,
        required: [true, "Please Enter Email"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Password"]
    },
    created_at: {
        type: Date,
        default: Date.now,
    }

})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;