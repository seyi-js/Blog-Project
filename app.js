const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const path = require('path')
const flash = require("connect-flash");
var session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose =  require('mongoose');
const PORT = process.env.PORT || 30;
const url = 'mongodb://localhost:27017/blogDB';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.log.bind(console, 'connection error'));
db.once('open', (callback) => {
	console.log('Connection to blogDB Established....')
});
//Passport config
require('./config/passport')(passport);

//Cookie Parser
app.use(cookieParser());
//Express Session
app.use(
    session({
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true
    })
);

// User model
const Admin = require("./models/admin");
//BODY PARSER CONFIG
app.use(bodyParser.urlencoded({extended: false}));

// passport
app.use(passport.initialize());
app.use(passport.session());
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

// connect-flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});






















app.listen(PORT, console.log(`Server started on port ${PORT}`));