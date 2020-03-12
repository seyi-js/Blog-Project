const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  dest: "./static/img/uploads"
});
const imageFolder="../static/img/uploads/";
const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
const async = require('async');
const crypto = require('crypto')

//For Post schema
const Post = require("../models/post");

//For Comment Schema

const Comment = require("../models/comment");

// User model
const User = require("../models/users");
//Settings Schema
const Settings = require('../models/settings')
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
const findById = (req, res, next) => {
  // var userId = req.query.userId ;
  var {userId} = req.session ;
  User.findOne({
    _id: userId
  }, (err, user) => {
    if (err) {
      // req.flash('error_msg', 'Problem submiting comment');
      res.redirect('/')
    } else {
      userdata = user;
      next();
    }
  })
}
//Users Settings/Edit Profile
router.get('/users/userSettings', findById, redirectLogin,(req, res)=> {
  const userId = userdata;
  // console.log(userId.profileimage)
  
  res.render('userSettings',{email: userId.email, contact: userId.contact,   profileImage: imageFolder + userId.profileimage})
});
//Users Settings/Edit Profile
router.post('/users/userSettings',findById,upload.single("ProfileImage"),(req, res)=>{
const {email, contact} = req.body;
//Prevent Empty Form
let profileImage;
if(req.file){
  profileImage = req.file.filename;
}else {
  profileImage = 'noimage.jpg';
}
if(!email || !contact){
  req.flash('error_msg', 'Please Fill in all Fields');
  res.redirect('/users/usersettings')
 
} else{
  
  userdata.contact = contact;
  userdata.email = email;
  userdata.profileimage = profileImage; 
  userdata.save();
  res.redirect('/users/dashboard')
}

});

//Forgot Password
router.get('/users/f_password',(req,res)=>{
  res.render('forgotUpassword');
});

router.post('/users/f_password', (req, res, next)=>{
  const email = req.body.email;
          async.waterfall([
            (done)=>{
              crypto.randomBytes(20, (err, buf)=> {
                var token = buf.toString('hex');
                done(err, token);
              });
            },
            (token, done)=> {
              User.findOne({email: req.body.email}, (err, user)=> {
                if(!user){
                  req.flash('error_msg', 'Invalid Email')
                  return res.redirect('/users/f_password');
                }
                // console.log(user)
                user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
              user.save((err) => {
                done(err, token, user);
              });
              });



            },
            (token, user, done)=>{
               //Here goes the node mailer stuff
              //  console.log(token)
               var transporter = nodemailer.createTransport({
                service: "gmail.com",
                port:587,
                secure: false,
                auth: {
                  user: process.env.GMAIL_USERNAME,
                  pass: process.env.GMAIL_PASSWORD
                },
                tls:{
                    rejectUnauthorized: false
                }
              });

              var mailOptions = {
                from: 'Nodemailer Contact "adebayosamueljahsmine925@gmail.com"',
                to: user.email,
                subject: "Sending Email using Node.js",
                text: 'Click the link below to reset your your password. Kindly disregard this email if you didnt request for a password reset link ' + 'https://' + req.headers.host + '/users/resetP/' + token + '\n\n',
                // html: outp
              };

              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                  req.flash('success_msg', `A password reset Link has been sent to ${email} with further instructions.`)
                  res.redirect('/users/f_password');
                }
              });

            }//
          ])


         //End of else
});


//Reset Password
router.get('/users/resetP/:token', (req, res)=>{
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},(err, user)=> {
  if(!user){
    req.flash('error_msg', 'Invalid Token');
    return res.redirect('/users/f_password');
  }
  res.render('resetUpassword', {token: req.params.token})
})
});

router.post('/users/resetP/:token', (req, res)=> {
  async.waterfall([
    (done) =>{
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},(err, user)=>{
    // console.log(req.params.token)
    if(err) {
      console.log(err)
      req.flash('error_msg', 'Invalid Token');
      return res.redirect('back');
    }
    if(!user){
      req.flash('error_msg', 'Invalid Token');
      return res.redirect('back');
    }
    const password1 = req.body.password1;
    const password2 = req.body.password2;
    if(password1 === password2){
      var newUser = {
        password2
      };
      //Hash Password
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password2, salt, (err, hash) => {
          if (err) {
            console.log(err);
            req.flash('error_msg', 'error changing password');
            res.redirect("back", {
              oldpassword,
              password1,
              password2
            });
          }
          // Set password to hashed
          newUser.password2 = hash;
            // save user
            var myquery = {
              email: user.email
            };
            var newvalues = {
              $set: {
                password: newUser.password2,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
              },
              $currentDate: {
                lastModified: true
              }
            };
            User.updateOne(myquery, newvalues, (err, data)=> {
              if(err) console.log(err);

              done(err, user);
            })

        })//
      )
    } else{
      req.flash('error_msg', 'password do not match');
      return res.redirect('back');
    }
  })
},
  (user, done)=>{

  var transporter = nodemailer.createTransport({
    service: "gmail",
    port:587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD
    },
    tls:{
        rejectUnauthorized: false
    }
  });

  var mailOptions = {
    from: 'Nodemailer Contact process.env.GMAIL_USERNAME',
    to: user.email,
    subject: "Sending Email using Node.js",
    text: `Your password to ${user.email} account has been Changed Successfully`,
    // html: output
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      req.flash("success_msg", "Password Changed Successfully.");
              req.session.userId = user._id;
              // console.log(req.session.userId)
              res.redirect("/");
    }
  });
}//
])
});




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
            profileimage:imageFolder + user.profileimage
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
    // resetPasswordToken = null
    // resetPasswordExpires= null

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
            password,
            // resetPasswordToken,
            // resetPasswordExpires
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
  Settings.findOne({}, (err, settings)=>{
    // console.log(settings.post_limit)
    var postLimit = Number(settings.post_limit);

    Post.find({})
    .populate("comments")
    // .distinct('comment')
    .sort({_id: -1})
    .limit(postLimit)
    .exec((err, posts) => {
      if (err) throw err;
      else {
        // console.log(posts[0].comments); //This access the first post=>first document in the comments array=>The comment
        // var testing = posts[0].comments;
        // console.log(testing[0].comment)
        // console.log(posts)
        res.render("users", {
          posts,
          userId,
          postLimit
        });
      }
    });


  })

});

router.get('/users/queryPost', (req, res)=>{
  var id = req.query.id;
  const {
    userId
  } = req.session; // The Id of the Logged-in user
  Post.findOne({_id: id}).populate('comments').exec((err, post)=>{
    res.render('post', {post, userId})
  })
});

//Get next Post
router.get('/users/get-posts/:start/:limit', (req,res)=>{
  Post.find({},(err, posts)=>{
    // var array = Array.from(posts)
    // if(posts.length !== 'undefined') {
      res.send(posts)
    // }


    // console.log(array)
   }).sort({_id:-1}).skip(parseInt(req.params.start)).limit(parseInt(req.params.limit))
})

module.exports = router;
