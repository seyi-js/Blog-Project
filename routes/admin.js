const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer({ dest: "./static/img/uploads" });

// From Post Schema
const Post = require("../models/post");

//From admin schema

const Admin = require("../models/admin");

// Redirect Login For protecting routes
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Please Login to View this resource')
    res.redirect("/admin/login");
  } else {
    next();
  }
};

// Redirect Home For already logged in persons
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/admin/dashboard");
  } else {
    next();
  }
};

//Admin DashBoard
router.get("/dashboard", redirectLogin, (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) throw err;
    else {
      res.render("adminBoard", { posts: posts });
    }
  });
});

//Login Page
router.get("/login", (req, res) => {
  res.render("adminLogin");
});

//Login Route for Admins
router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  Admin.findOne({ username: username })
    .then(user => {
      if (!user) {
        res.redirect("/admin/login");
      } else {
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            //Passing the authenticated user Id into the session
            req.session.userId = user._id;
            res.redirect("/admin/dashboard");
            req.flash('sucess_msg', 'Login Sucessful')
          } else {
            res.redirect("/admin/login");
          }
        });
      }
    }).catch(err => console.log(err));
      // res.redirect('/admin/login')


});

//Logout Route
router.get("/logout", redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/admin/dashboard");
    } else {
      res.clearCookie(process.env.SESSION_NAME);
      res.redirect("/admin/login");
    }
  });
});

router.get("/register", (req, res) => res.render("adminReg"));

// Register Handle
router.post(
  "/register",
  upload.single("ProfileImage"),(req, res) => {
    console.log(req.body.email);
    console.log(req.body)
    if (req.file) {
      console.log("File uploaded!");
      var profileimage = req.file.filename;
      //   console.log(profileimage);
    } else {

      var profileimage = "noimage.jpg";
    }

    const {
      firstname,
      lastname,
      username,
      email,
      contact,
      password,
      password2
    } = req.body;

    let errors = [];

    //Check required field
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !contact ||
      !password ||
      !password2
    ) {
      errors.push({ msg: "Please fill in all fields" });
    }

    //check password match
    if (password !== password2) {
      errors.push({ msg: "Passwords do not match" });
    }
    // check pass length
    if (password.length < 6) {
      errors.push({ msg: "Password should be atleast 6 characters" });
    }

    if (errors.length > 0) {
      res.render("adminReg", {
        errors,
        firstname,
        lastname,
        username,
        email,
        contact,
        password,
        password2
      });
    } else {
      //Validation passed
      Admin.findOne({ email: email }).then(admin => {
        if (admin) {
          //User Exists
          errors.push({ msg: "Email already Exist" });
          res.render("adminReg", {
            errors,
            firstname,
            lastname,
            username,
            email,
            contact,
            password,
            password2
          });
        } else {
          Admin.findOne({ username: username }).then(admin => {
            if (admin) {
              errors.push({ msg: "Username Exist" });
              res.render("adminReg", {
                errors,
                firstname,
                lastname,
                username,
                email,
                contact,
                password,
                password2
              });
            } else {
              const newAdmin = new Admin({
                firstname,
                lastname,
                username,
                email,
                contact,
                password
              });
              //Hash Password
              bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                  if (err) throw err;
                  // Set password to hashed
                  newAdmin.password = hash;
                  // save user
                  Admin.create(newAdmin, (err, admin) => {
                    if (err) throw err;
                    else {
                      req.session.userId = admin._id;// Saving the particular user Id into session
                      req.flash("success_msg", "Registration Successful.");
                      res.redirect("/admin/dashboard");
                    }
                  });
                })
              );
            }
          }).catch(err => {
            if(err)
            console.log(err)
            req.flash('error_msg', 'Form could Not be summitted');
            res.redirect('/admin/register')
          })
        }
      });
    }
  }
);
//Posting Route For Admins
router.post("/post", redirectLogin, (req, res) => {
  var post = req.body.post;
  var title = req.body.title;
  var errors = [];
  if (!title || !post) {
    res.redirect("/admin/dashboard");
  } else {

    var newItem = new Post({
      title: req.body.title,
      post: req.body.post
    });
    console.log(newItem);
    Post.create(newItem, (err, Post) => {
      if (err) throw err;
      else {
        const PostId = Post._id;
        console.log(PostId)//Post Id
        res.redirect("/admin/dashboard");
      }
    });

  }
});

//Edit Page

router.get("/edit", redirectLogin, (req, res) => {
  var id = req.query.post;
  Post.findOne({ _id: id }, (err, result) => {
    if (err) throw err;
    else {
      var posts = result;
      res.render("edit", {
        title: posts.title,
        post: posts.post,
        id: posts._id
      });
    }
  });
});

//Edit/Update Route
router.post("/update", redirectLogin, (req, res) => {
  var id = req.query.id;
  var title = req.body.title;
  var post = req.body.post;
  var errors = [];
  if (!title || !post) {
    res.redirect("/admin/dashboard");
  } else {
    var myquery = { _id: id };
    var newItem = {
      $set: { post: req.body.post, title: req.body.title },
      $currentDate: { lastModified: true }
    };


    Post.updateOne(myquery, newItem, function (err, res) {
      if (err) throw err;

    });
  }
  res.redirect("/admin/dashboard");
});

//Delete Route

router.get("/delete", redirectLogin, (req, res) => {
  var id = req.query.post;
  var query = { _id: id };

  Post.deleteOne(query, (err, result) => {
    if (err) throw err;
    // console.log(result)
  });

  res.redirect("/admin/dashboard");
});

module.exports = router;
