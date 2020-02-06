const express = require('express');
const router = express.Router();
const path = require('path')
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require('mongoose');
const url = "mongodb://localhost:27017/blogDB";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

//For Post schema
const Post = require('../models/post')


//Route for users to access Post
router.get('/', (req, res)=> {
	Post.find({}, (err, posts) => {
		if(err) throw err;
		else {
			res.render('users', {posts: posts})
		}
	})
});


module.exports = router