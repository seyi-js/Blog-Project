const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const dotenv = require('dotenv');
//This File path/location must be same every where posted
const upload = multer({ dest: "./static/img/uploads" });
const path = require('path')
const flash = require("connect-flash");
var session = require("express-session");
const passport = require('passport');
const mongoose =  require('mongoose');
const MongoStore = require('connect-mongo')(session)
const PORT = process.env.PORT || 5000;
const url = 'mongodb://localhost:27017/blogDB';
mongoose.set('useCreateIndex', true);
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.log.bind(console, 'connection error'));
db.once('open', (callback) => {
	console.log('Connection to blogDB Established....')
});


dotenv.config();
// comment model
const Comment = require("./models/comment");

const Post = require("./models/post");

// User model
const User = require("./models/users");


//Cookie Parser
app.use(cookieParser());

const IN_PROD = process.env.NODE_ENV === 'production'
//Express Session
app.use(session({
    name:process.env.SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        mongooseConnection: db
    }),
    cookie: {
        maxAge:1000 * 60 * 60 * 2,
        originalMaxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        secure: IN_PROD
    }
        })
    );
// passport
app.use(passport.initialize());
app.use(passport.session());

// connect-flash
app.use(flash());

// User model
const Admin = require("./models/admin");

//BODY PARSER CONFIG
app.use(bodyParser.urlencoded({extended: false}));

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//EJS CONFIG
app.use(expressLayouts);
app.set('veiws', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

//SERVING STATIC FILES
app.use(express.static('static'));
app.use('/static', express.static('static'));
app.use(express.static(__dirname + '/static'));

//ROUTES
app.use('/', require('./routes/index'));
app.use("/admin", require("./routes/admin"));




// const blogpost= Post.findOne({'_id': "5e3acf566dca6e36acefc2f2"}).populate('comments');

// const commentIds = blogpost;

// console.log(commentIds)



// Post.findOne({'comments' :"5e402d3b18717cc2027b1a7f" }).populate('comments').exec((err, person) => {
//     if(err) throw err;
//     console.log(person)
// })





















app.listen(PORT, console.log(`Server started on port ${PORT}`));
