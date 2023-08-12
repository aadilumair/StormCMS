var express = require("express");
var router = express.Router();
var defaultController = require("../controllers/defaultcontroller.js");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');

router.all("/*", (req, res, next) => {
    req.app.locals.layout = 'default';

    next();
});

router.route('/')
    .get(defaultController.index);




// Defining Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({email: email}).then(user => {
        if (!user) {
            return done(null, false, req.flash('error-message', 'User not found with this email.'));
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
            if (err) {
                return err;
            }

            if (!passwordMatched) {
                return done(null, false, req.flash('error-message', 'Invalid Username or Password'));
            }

            return done(null, user, req.flash('success-message', 'Login Successful'));
        });

    });
}));

passport.serializeUser(function(user, done) {
        process.nextTick(function() {
        done(null, { id: user.id, username: user.email });
      });
});

passport.deserializeUser(function(id, done) {
    process.nextTick(function() {
        return done(null, id);
      });
});

router.route('/login')
    .get(defaultController.loginGet)
    .post(passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: true,
        session: true
    }) ,defaultController.loginPost);





router.route('/about')
    .get(defaultController.about);

router.route('/post/:id')
    .get(defaultController.singlePost);


router.get('/logout', (req, res)=>{
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash("success-message", "Logged out");
        res.redirect('/');
      });

    
    
});

module.exports = router;