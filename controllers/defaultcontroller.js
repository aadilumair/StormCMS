var Post = require('../models/PostModel');
var Category = require('../models/CategoryModel');
var User = require('../models/UserModel');
var bcrypt = require('bcryptjs');
module.exports = {
    index: async (req, res) => {
        var posts = await Post.find();
        var categories = await Category.find();

        
        res.render('default/index', {posts: posts, categories: categories});
    },

    loginGet: (req, res) => {
        res.render('default/login',{message: req.flash('error')});
    },

    loginPost: (req, res) => {
        
    },

    registerGet: (req, res) => {
        res.render('default/register');
    },
    
    registerPost: (req, res) => {
        let errors = [];
        if(!req.body.firstName){
            errors.push({message: 'First Name is mandatory'});
        }
        if(!req.body.lastName){
            errors.push({message: 'Last Name is mandatory'});
        }
        if(!req.body.email){
            errors.push({message: 'Email is mandatory'});
        }
        if(req.body.password!=req.body.passwordConfirm){
            errors.push({password: 'Passwords do not match'});
        }
        
        if(errors.length>0){
            res.render('default/register', {
                errors: errors,
                firstName: req.body.firstName,
                lastName:req.body.lastName,
                email:req.body.email,
            })
        }
        else {
            User.findOne({email:req.body.email}).then(user => {
                if(user){
                    req.flash("error-message", 'Email in use, please try logging in');
                    res.redirect('/login');
                }
                else {
                    var newUser = new User(req.body);

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash)=> {
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success-message',"Registeration successful");
                                res.redirect('/login');
                            });
                        });
                    });
                }
            });
        }

    },

    admin: (req, res) => {
        res.render('default/admin');
    },

    about: (req, res) => {
        res.render('default/about');
    },

    singlePost: (req,res) => {
        Post.findById(req.params.id).then(post => {
            if (!post){
                res.status(404).json({message:'Post not found'});
            }
            else {
                res.render('default/singlePost', {post: post});
            }
        });
    },

};