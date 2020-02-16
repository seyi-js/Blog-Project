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
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session)
const PORT = process.env.PORT || 80;
mongoose.set('useCreateIndex', true);
//Switching between url in production and dev
let url;
if (process.env.NODE_ENV !== 'production') {
    url = 'mongodb://localhost:process.env.MONG0_URL/blogDB';
} else {

   url = 'mongodb+srv://samuel:OLUWASEYI@cluster0-ss5ul.mongodb.net/test?retryWrites=true&w=majority'
}
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("MongoDB Connected...")
});

//Process .env config
dotenv.config();


//Cookie Parser
app.use(cookieParser());
//BODY PARSER CONFIG
app.use(bodyParser.urlencoded({ extended: false }));

// const IN_PROD = process.env.NODE_ENV === 'production'
//Express Session
app.use(session({
    name: process.env.SESSION_NAME,
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        mongooseConnection: db
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,//Expires in 24hours
        originalMaxAge: 1000 * 60 * 60 * 24,//Expires in 24hours
        sameSite: true,
        secure: true
    }
})
);
// connect-flash
app.use(flash());




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


//Catch all other route

app.get("*", (req, res) => {
    res.send("<h1>error 404 Page not Found</h1>");
});





















app.listen(PORT, console.log(`Server started on port ${PORT}`));
