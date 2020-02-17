const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  dest: "./static/img/uploads"
});
const bcrypt = require("bcryptjs");

//For Post schema
const Post = require("../models/post");

//For Comment Schema

const Comment = require("../models/comment");

// User model
const User = require("../models/users");

// Redirect Login For protecting routes
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Please Login to View this resource')
    res.redirect("/users/login");
  } else {
    next();
  }
};

// Redirect Home For already logged in persons
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/users/dashboard");
  } else {
    next();
  }
};
//fOR FINDING USERS BY ID
let userdata;
const findById = (req, res, next) => {
  var userId = req.query.userId;
  User.findOne({
    _id: userId
  }, (err, user) => {
    if (err) {
      req.flash('error_msg', 'Problem submiting comment');
      res.redirect('/')
    } else {
      userdata = user;
      next();
    }
  })
}

//Change Password
router.get('/users/changepwd', redirectLogin, (req, res) => {
  res.render('changeUpwd');
});
router.post('/users/changepwd', (req, res) => {
  var {
    userId
  } = req.session;
  var oldpassword = req.body.oldpassword
  var password1 = req.body.password1;
  var password2 = req.body.password2;
  var errors = []
  if (!oldpassword || !password1 || !password2) {
    req.flash('error_msg', 'Fill in all fields');
    res.render("changeUpwd", {
      oldpassword,
      password1,
      password2
    });
  }

  if (password1 !== password2) {
    req.flash('error_msg', 'Password don\t match');
    res.render("changeUpwd", {
      oldpassword,
      password1,
      password2
    });
  } else {
    User.findOne({
      _id: userId
    }, (err, user) => {
      if (err) {
        console.log(err)
        req.flash('error_msg', 'error changing password');
        res.render("changeUpwd", {
          oldpassword,
          password1,
          password2
        });
      } else {
        if (user !== null) {
          bcrypt.compare(oldpassword, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
              req.flash('error_msg', "Old Passwords do not match");
              res.render("changeUpwd", {
                oldpassword,
                password1,
                password2
              });
            } else {
              var newUser = {
                password2
              };
              //Hash Password
              bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(newUser.password2, salt, (err, hash) => {
                  if (err) {
                    console.log(err);
                    req.flash('error_msg', 'error changing password');
                    res.render("changeUpwd", {
                      oldpassword,
                      password1,
                      password2
                    });
                  }
                  // Set password to hashed
                  newUser.password2 = hash;

                  // save user
                  var myquery = {
                    _id: userId
                  };
                  var newvalues = {
                    $set: {
                      password: newUser.password2
                    },
                    $currentDate: {
                      lastModified: true
                    }
                  };
                  User.updateOne(myquery, newvalues, function (
                    err,
                    data
                  ) {
                    if (err) {
                      console.log(err);
                      req.flash('error_msg', 'error changing password');
                      res.render("changeUpwd", {
                        oldpassword,
                        password1,
                        password2
                      });
                    } else {
                      //Success Msg
                      req.flash("success_msg", "Password Changed Successfully.");
                      res.redirect("/users/dashboard");
                    }

                  });

                })
              );
            }
          })
        };
      }
    })
  }

})

//User Dashboard
router.get("/users/dashboard", redirectLogin, (req, res) => {
  // const {user} = res.locals
  const {
    userId
  } = req.session;
  if (!userId) {
    req.flash('error_msg', 'Please Login to View this resource')
    // res.redirect('/users/login')
  } else {
    User.findOne({
      _id: userId
    }, (err, doc) => {
      if (err) {
        console.log(err);
        req.flash('error_msg', 'Please Login to View this resource')
        res.redirect('/users/login')
      } else {
        if (doc != null) {
          const user = doc;
          res.render("userDashboard", {
            lastname: user.lastname,
            firstname: user.firstname,
            email: user.email,
            contact: user.contact,
            dob: user.dob,
            gender: user.gender,
            date: new Date().toLocaleString(),
            // profileimage:imageFolder + req.user.profileimage
          });
        } else {
          req.flash('error_msg', 'Please Login to View this resource')
          res.redirect('/users/login')
        }

      }

    })
  }
});
//Route for comments
router.post("/comment", findById, redirectLogin, (req, res) => {
  var postId = req.query.id;
  var userID = userdata
  var comment = req.body.comment;
  // console.log(`user id ${userID.email}`)


  var newComment = new Comment({
    comment: req.body.comment
  });
  //   console.log()
  Comment.create(newComment, (err, comment) => {
    if (err) throw err;
    else {
      var commentId = comment._id;
      // console.log(commentId);
      Post.findOne({
        _id: postId
      }, (err, result) => {
        if (err) throw err;
        else {
          var post = result;
          // console.log(post);
          post.comments.push(commentId);
          post.save();
        }
      });
    }
  });
  res.redirect("/");
});

// Login Handle
router.post("/users/login", redirectHome, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
      email: email
    })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'Incorrect Email or Password')
        res.redirect('/users/login')
      } else {
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            //Passing the authenticated user Id into the session
            req.session.userId = user._id;
            // console.log(req.session.userId)
            res.redirect("/");
          } else {
            req.flash('error_msg', 'Incorrect Email or Password')
        res.redirect('/users/login')
          }
        });
      }
    })
    .catch(err => console.log(err));
    // res.redirect('/users/login')
});

//Users Login
router.get("/users/login", (req, res) => {
  res.render("userLogin");
});

// Users Logout route
router.get("/users/logout", redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/");
    } else {
      res.clearCookie(process.env.SESSION_NAME);
      res.redirect("/");
    }
  });
});

//Users Registration Route
router.get("/users/register", (req, res) => {
  res.render("userReg");
});

//Registration route
router.post(
  "/users/register",
  redirectHome,
  upload.single("ProfileImage"),
  (req, res) => {
    if (req.file) {
      console.log("File uploaded!");
      var profileimage = req.file.filename;
      // profileimage+='.jpg';
      // console.log(profileimage);
      //   console.log(profileimage);
    } else {
      // console.log('No file uploaded!!!!!');
      var profileimage = "noimage.jpg";
    }
    const
      firstname = req.body.firstname.toLowerCase();
    // console.log(firstname)
    lastname = req.body.lastname.toUpperCase();
    dob = req.body.dateofbirth;
    gender = req.body.gender;
    email = req.body.email;
    contact = req.body.contact;
    password = req.body.password;
    password2 = req.body.password2;

    let errors = [];

    //Check required field
    if (
      !firstname ||
      !lastname ||
      !dob ||
      !gender ||
      !email ||
      !contact ||
      !password ||
      !password2
    ) {
      errors.push({
        msg: "Please fill in all fields"
      });
    }

    //check password match
    if (password !== password2) {
      errors.push({
        msg: "Passwords do not match"
      });
    }
    //check pass length
    if (password.length < 6) {
      errors.push({
        msg: "Password should be atleast 6 characters"
      });
    }

    if (errors.length > 0) {
      res.render("userReg", {
        errors,
        firstname,
        lastname,
        dob,
        gender,
        email,
        profileimage,
        contact,
        password,
        password2
      });
    } else {
      //Validation passed
      User.findOne({
        email: email
      }).then(user => {
        if (user) {
          //User Exists
          errors.push({
            msg: "Email already Exist"
          });
          res.render("userReg", {
            errors,
            firstname,
            lastname,
            dob,
            profileimage,
            gender,
            email,
            contact,
            password,
            password2
          });
        } else {
          const newUser = new User({
            firstname,
            lastname,
            dob,
            profileimage,
            gender,
            email,
            contact,
            profileimage,
            password
          });
          //Hash Password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // Set password to hashed
              newUser.password = hash;
              // save user
              User.create(newUser, (err, name) => {
                if (err) throw err;
                else {
                  // console.log(name)
                  req.session.userId = name._id;
                  req.flash("success_msg", "Registration Successful.");
                  res.redirect("/");
                }
              });
            })
          );
        }
      }).catch(err => {
        if (err) {
          console.log(err)
          req.flash('error_msg', 'Form could not be submitted')
          res.redirect('/users/register')
        }
      })
    }
  }
);

// });
router.get("/", (req, res) => {
  const {
    userId
  } = req.session; // The Id of the Logged-in user
  // console.log(`req.session ${req.session.userId}`)
  Post.find({})
    .populate("comments")
    // .distinct('comment')
    .exec((err, posts) => {
      if (err) throw err;
      else {
        // console.log(posts[0].comments); //This access the first post=>first document in the comments array=>The comment
        // var testing = posts[0].comments;
        // console.log(testing[0].comment)
        // console.log(posts)
        res.render("users", {
          posts: posts,
          userId
        });
      }
    });
});

module.exports = router;