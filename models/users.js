var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        // required: true
    },
    gender: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        default: new Date().toLocaleString()
    },
    contact: {
        type: Number,
        required: true
    },
    profileimage: {
        type : String,
    },
    });

   
const User = mongoose.model('User', userSchema,'users' );
module.exports = User 
