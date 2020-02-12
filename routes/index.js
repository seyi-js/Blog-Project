const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: "./static/img/uploads"});
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
    res.redirect("/users/login");
  } else {
    next();
  }
};

// Redirect Home For already logged in persons
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};

//Route for comments

router.post("/comment",redirectLogin, (req, res) => {
	var postId = req.query.id;
	var comment= req.body.comment;
	var newComment = new Comment({
        comment: req.body.comment,
       

      });
    //   console.log()
       Comment.create(newComment, (err, comment) => {
    if(err) throw err;
    else{
      var commentId= comment._id
      console.log(commentId)
      Post.findOne({_id: postId}, (err, result) => {
    if(err) throw err;
    else{
        var post= result
        console.log(post)
        post.comments.push(commentId)
        post.save()

    }
} )
      
    }
  })
  res.redirect("/");
});


// Login Handle
router.post("/users/login",redirectHome, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
  .then(user => {
    if (!user) {
       res.send('email not found');
    }else {
       // Match password

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        //Passing the authenticated user Id into the session
        req.session.userId = user._id
    res.redirect('/');
    
    
      } else {
        res.send('failed')
      }
    });

  
    }
   
  })
  .catch(err => console.log(err));
  });



//Users Login 
router.get('/users/login', (req, res) => {
	res.render('userLogin')
});

// Users Logout route
router.get("/users/logout",redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.redirect('/')
    }else {
      res.clearCookie(process.env.SESSION_NAME)
      res.redirect('/users/login')
    }
  })
});
//Users Registration Route

router.get("/users/register", (req, res) => {
  res.render("userReg");
});
//Registration route
router.post("/users/register",redirectHome, upload.single("ProfileImage"), (req, res) => {
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
  const { name, email, contact, password, password2 } = req.body;
  let errors = [];

  //Check required field
  if (!name || !email || !contact || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  //check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }

  if (errors.length > 0) {
    res.render("userReg", {
      errors,
      name,
      email,
      contact,
      password,
      password2
    });
  } else {
    //Validation passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        //User Exists
        errors.push({ msg: "Email already Exist" });
        res.render("register", {
          errors,
          name,
          email,
          contact,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
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
                req.session.userId= name._id;
                req.flash(
                  "success_msg",
                  "Registration Successful."
                );
                res.redirect("/");
              }
              
            });
           
            
            
            
          })
        );
      }
    });
  }
});

//Route for users to access Post
router.get("/", redirectLogin,(req, res) => {
  const {userId} = req.session;// The Id of the logged in user
  console.log(req.session)
  Post.find({}, (err, posts) => {
    if (err) throw err;
    else {
      res.render("users", { posts: posts});
    }
  }).populate('comments').exec((err, time)=> {
    if(err) throw err;
    // console.log(time);
  })
// console.log(blogpost)


  
});

// router.get('/', (req, res)=> {
//   Post.find({}).populate('comments').exec((err, posts) => {
//     if(err) throw err;
//     console.log(posts)
//     res.render("users", { posts: posts });
// })

// })

module.exports = router;
