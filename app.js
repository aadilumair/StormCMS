var {globalVariables} = require("./config/config.js");

const { urlencoded } = require("body-parser");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
const hbs = require("express-handlebars");
var {mongoDbUrl, PORT} = require("./config/config.js")
var flash = require("connect-flash");
var session = require("express-session");
var sessionStore = new session.MemoryStore;
var methodOverride = require('method-override');
var {selectOption} = require("./config/customFunctions.js");
var fileupload = require('express-fileupload');
var passport = require('passport');
var app = express();


//config mongoose
mongoose.connect(mongoDbUrl, {useNewUrlParser: true})
    .then(response =>{
        console.log("MongoDB connection successful");
    }).catch(err =>{
        console.log('DB connection failed');
    });


// Config express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname);

//config session and flash
app.use(session({
    secret: 'anysecret',
    saveUninitialized: 'true',
    store: sessionStore,
    resave: 'true'
}));
app.use(flash());

/* Passport Initialize */
app.use(passport.initialize());
app.use(passport.session());

app.use(globalVariables);



//fileupload
app.use(fileupload());


//View engine with handlebars setup
app.engine('handlebars', hbs.engine({defaultLayout: 'default',runtimeOptions: {allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true},helpers: {select: selectOption}}));

app.set('view engine' , 'handlebars');

//method override
app.use(methodOverride("newMethod"));

// routes
var defaultRoutes = require('./routes/defaultroutes.js');
var adminRoutes = require('./routes/adminroutes.js');
app.use('/', defaultRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT,() => {
    console.log("Server running on port "+ (PORT));
});