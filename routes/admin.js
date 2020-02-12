const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/blogDB";
// const autoIncrement = require("mongodb-autoincrement");
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const { ensureAuthenticated } = require("../config/adminAuth");

// From Post Schema
const Post = require("../models/post");

//From admin schema

const Admin = require("../models/admin");

//From Global
const global = require("../global");

//passport config
require("../config/adminPassport")(passport);

//Admin DashBoard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) throw err;
    else {
      res.render("adminBoard", { posts: posts });
    }
  });
});

//Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

//Login Route for Admins
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
    // failureFlash: true,
    session: true
  })(req, res, next);
});

//Logout Route
router.get("/logout", (req, res) => {
  req.logout();
  // req.flash("success_msg", "You are now logged Out");
  global.info = {};
  global.empty = true;
  res.redirect("/admin/login");
});

router.get("/register", (req, res) => res.render("admin"));

// Register Handle
router.post(
  "/register",
  /*upload.single("ProfileImage"),*/ (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const contact = req.body.contact;
    const password = req.body.password;
    let errors = [];

    //Check required field
    if (!username || !email || !contact || !password) {
      errors.push({ msg: "Please fill in all fields" });
      res.send("Failed");
    }

    //check password match
    // if (password !== password2) {
    //   errors.push({ msg: "Passwords do not match" });
    // }
    // //check pass length
    // if (password.length < 6) {
    //   errors.push({ msg: "Password should be atleast 6 characters" });
    // }

    // if (errors.length > 0) {
    //   res.render("register", {
    //     errors,
    //     username,
    //     email,
    //     contact,
    //     password,
    //     password2
    //   });
    // }
    else {
      //Validation passed
      Admin.findOne({ username: username }).then(user => {
        if (user) {
          //User Exists
          // errors.push({ msg: "username already Exist" });
          res.render("admin", {
            username,
            email,
            contact,
            password
          });
        } else {
          const newUser = new User({
            username,
            email,
            contact,
            password
          });
          //Hash Password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // Set password to hashed
              newUser.password = hash;
              // save user
              Admin.create(newUser, (err, collection) => {
                if (err) throw err;
              });
              // req.flash(
              //   "success_msg",
              //   "Registration Successful. You can now Log In"
              // );
              res.redirect("/admin/login");
            })
          );
        }
      });
    }
  }
);

//Posting Route For Admins
router.post("/post", (req, res) => {
  var post = req.body.post;
  var title = req.body.title;
  var errors = [];
  // console.log(title)
  // console.log(post)
  if (!title || !post) {
    res.redirect("/admin/dashboard");
  }
  // if(post == ''){
  //   res.redirect('/admin')
  // }
  else {
    db.collection("posts").findOne(
      {},
      { sort: { post_id: -1 } },
      (err, item) => {
        if (item == null) {
          lastId = 0;
        } else {
          lastId = Number(item["post_id"]);
        }
        console.log(item);
        var newItem = new Post({
          post_id: lastId + 1,
          title: req.body.title,
          post: req.body.post
        });
        console.log(newItem);
        Post.create(newItem, (err, Post) => {
          if (err) throw err;
          else {
            // console.log(Todo)
            res.redirect("/admin/dashboard");
          }
        });
      }
    );
  }
});

//Edit Page

router.get("/edit", (req, res) => {
  var id = req.query.post;
  Post.findOne({ _id: id }, (err, result) => {
    if (err) throw err;
    else {
      var posts = result;
      res.render("edit", {
        title: posts.title,
        post: posts.post,
        id: posts._id
        // console.log(post)
      });
    }
  });
});

//Edit/Update Route
router.post("/update", (req, res) => {
  var id = req.query.id;
  var title = req.body.title;
  var post = req.body.post;
  var errors = [];
  if (!title || !post) {
    res.redirect("/admin/dashboard");
  } else {
    // var posts = result[id];
    // console.log(posts)
    var myquery = { _id: id };
    var newItem = {
      $set: { post: req.body.post, title: req.body.title },
      $currentDate: { lastModified: true }
    };

    // console.log(newvalues)
    // console.log(newItem)
    Post.updateOne(myquery, newItem, function(err, res) {
      if (err) throw err;
      // console.log("1 document updated");
    });
  }
  res.redirect("/admin/dashboard");
});

//Delete Route

router.get("/delete", (req, res) => {
  var id = req.query.post;
  var query = { _id: id };

  Post.deleteOne(query, (err, result) => {
    if (err) throw err;
    // console.log(result)
  });

  res.redirect("/admin/dashboard");
});

//Catch all other route

router.get("*", (req, res) => {
  res.send("<h1>error 404 Page not Found</h1>");
});

module.exports = router;
